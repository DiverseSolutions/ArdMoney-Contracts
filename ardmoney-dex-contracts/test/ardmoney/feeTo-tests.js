const { expect } = require("chai");
const {formatEther} = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const { 
  initializeDummyTokens,
  initializeArdMoneyContracts,
  approveToken,
  tokenMint,
} = require('./helpers.js');

describe("ArdMoney Fee To Testing", function () {
  const fakeDeadline = 2648035579;
  let owner,odko,amaraa,feeSetter,routerAdmin,feeTo;
  let factory,router,weth;
  let tokenA,tokenB;

  // 100% == 1000 || 3% == 30 || 0.3% == 3
  let swapFee;
  let mintFee;

  this.beforeEach(async function (){
    [owner,odko,amaraa,feeSetter,routerAdmin,pairAdmin,feeTo] = await ethers.getSigners();

    swapFee = 3;
    mintFee = 3;

    [ factory,router,weth ] = await initializeArdMoneyContracts( feeSetter.address, routerAdmin.address, swapFee, mintFee);
    [ tokenA,tokenB ] = await initializeDummyTokens();

    await factory.connect(feeSetter).setFeeTo(feeTo.address);

    await tokenMint(tokenA,'2000',amaraa.address,owner)
    await tokenMint(tokenA,'1000',odko.address,owner)
    await tokenMint(tokenB,'1000',odko.address,owner)

    await factory.connect(feeSetter).createPair(
      tokenA.address,
      tokenB.address,
      mintFee,
      swapFee,
      pairAdmin.address
    )

    await approveToken(router,tokenA,'200',odko)
    await approveToken(router,tokenB,'200',odko)

  })


  it("Add Dynamic Pool", async function () {

    let pairAddress = await factory.allPairs(0)
    let pair = await ethers.getContractAt('ArdMoneyPair',pairAddress)


    await approveToken(router,tokenA,'1000',odko)
    await approveToken(router,tokenB,'1000',odko)

    console.log(ethers.utils.formatUnits(await pair.balanceOf(feeTo.address),18))
    await router.connect(odko).addLiquidity(
      tokenA.address,
      tokenB.address,
      ethers.utils.parseUnits('200',18),
      ethers.utils.parseUnits('200',18),
      1,
      1,
      odko.address,
      2648035579
    )

    console.log("Swap START")
    await approveToken(router,tokenA,'100',amaraa)
    let amountInWei = ethers.utils.parseEther('100',18)
    let path = [tokenA.address,tokenB.address]
    let [,amountsOutWei] = await router.getAmountsOut(amountInWei,path)
    await router.connect(amaraa).swapExactTokensForTokens(
      amountInWei,
      1,
      path,
      amaraa.address,
      fakeDeadline
    )
    console.log("Swap END")

    console.log(ethers.utils.formatUnits(await pair.balanceOf(feeTo.address),18))
    await router.connect(odko).addLiquidity(
      tokenA.address,
      tokenB.address,
      ethers.utils.parseUnits('200',18),
      ethers.utils.parseUnits('200',18),
      1,
      1,
      odko.address,
      2648035579
    )
    console.log(ethers.utils.formatUnits(await pair.balanceOf(feeTo.address),18))

  });

});

