const { expect } = require("chai");
const { ethers } = require("hardhat");
const { 
  initializeDummyTokens,
  initializeArdMoneyContracts,
  approveToken,
  tokenMint,
} = require('./helpers.js');

describe("ArdMoney Pair Admin Functionalities", function () {
  let owner,odko,amaraa,feeSetter,routerAdmin;
  let factory,router,weth,pair;
  let pairAddress;
  let tokenA,tokenB;

  // 100% == 1000 || 3% == 30 || 0.3% == 3
  let swapFee;
  let mintFee;

  this.beforeEach(async function (){
    [owner,odko,amaraa,feeSetter,routerAdmin] = await ethers.getSigners();

    swapFee = 3;
    mintFee = 3;

    [ factory,router,weth ] = await initializeArdMoneyContracts( feeSetter.address, routerAdmin.address, swapFee, mintFee);
    [ tokenA,tokenB ] = await initializeDummyTokens();

    await tokenMint(tokenA,'1000',feeSetter.address,owner)
    await tokenMint(tokenB,'1000',feeSetter.address,owner)

    // Create Liquidity
    await approveToken(router,tokenA,'100',feeSetter)
    await approveToken(router,tokenB,'100',feeSetter)

    await router.connect(feeSetter).addLiquidity(
      tokenA.address,
      tokenB.address,
      ethers.utils.parseUnits('100',18),
      ethers.utils.parseUnits('100',18),
      1,
      1,
      feeSetter.address,
      2648035579
    )

    pairAddress = await factory.allPairs(0)
    pair = await ethers.getContractAt('ArdMoneyPair',pairAddress)

    await tokenMint(tokenA,'2000',amaraa.address,owner)
    await tokenMint(tokenB,'2000',amaraa.address,owner)
  })

  it("Pair Pause - Swap", async function () {
    await pair.connect(routerAdmin).pause()

    await approveToken(router,tokenA,'100',amaraa)

    let amountInWei = ethers.utils.parseEther('100',18)
    let path = [tokenA.address,tokenB.address]

    let [,amountsOutWei] = await router.getAmountsOut(amountInWei,path)

    await expect(router.connect(amaraa).swapExactTokensForTokens(
      amountInWei,
      1,
      path,
      amaraa.address,
      2648035579
    )).to.be.revertedWith("PAUSED")

  });

  it("Pair Pause - Add Liquidity", async function () {
    await pair.connect(routerAdmin).pause()

    await approveToken(router,tokenA,'500',amaraa)
    await approveToken(router,tokenB,'500',amaraa)

    await expect(router.connect(amaraa).addLiquidity(
      tokenA.address,
      tokenB.address,
      ethers.utils.parseUnits('500',18),
      ethers.utils.parseUnits('500',18),
      1,
      1,
      amaraa.address,
      2648035579
    )).to.be.revertedWith("PAUSED")

  });

  it("Pair Pause - Remove Liquidity", async function () {

    await approveToken(router,tokenA,'500',amaraa)
    await approveToken(router,tokenB,'500',amaraa)

    await router.connect(amaraa).addLiquidity(
      tokenA.address,
      tokenB.address,
      ethers.utils.parseUnits('500',18),
      ethers.utils.parseUnits('500',18),
      1,
      1,
      amaraa.address,
      2648035579
    )
    
    let pairBalanceBN = await pair.balanceOf(amaraa.address)
    let pairBalance = ethers.utils.formatUnits(pairBalanceBN.toString(),18)

    await pair.connect(routerAdmin).pause()

    await approveToken(router,pair,'200',amaraa)
    await expect(router.connect(amaraa).removeLiquidity(
      tokenA.address,
      tokenB.address,
      ethers.utils.parseUnits('200',18),
      1,
      1,
      amaraa.address,
      2648035579
    )).to.be.revertedWith("PAUSED")

  });

});

