const { expect } = require("chai");

async function initializeDummyTokens(){
  const DummyTokenA = await ethers.getContractFactory("DummyTokenA");
  const dummyTokenAContract = await DummyTokenA.deploy();
  await dummyTokenAContract.deployed();

  const DummyTokenB = await ethers.getContractFactory("DummyTokenB");
  const dummyTokenBContract = await DummyTokenB.deploy();
  await dummyTokenBContract.deployed();

  return [dummyTokenAContract,dummyTokenBContract] 
}

async function initializeArdMoneyContracts(feeSetterAddress,routerAdminAddress,swapFee,mintFee){
  const WETH9Mock = await ethers.getContractFactory("WETH9Mock");
  const wETHContract = await WETH9Mock.deploy();
  await wETHContract.deployed();

  const ArdMoneyFactory = await ethers.getContractFactory("ArdMoneyFactory");
  const ardMoneyFactoryContract = await ArdMoneyFactory.deploy(feeSetterAddress);
  await ardMoneyFactoryContract.deployed();

  const ArdMoneyRouter = await ethers.getContractFactory("ArdMoneyRouter");
  const ardMoneyRouterContract = await ArdMoneyRouter.deploy(
    ardMoneyFactoryContract.address,
    wETHContract.address,
    routerAdminAddress,
    swapFee,
    mintFee,
  );

  await ardMoneyRouterContract.deployed();

  return [ardMoneyFactoryContract,ardMoneyRouterContract,wETHContract]
}

async function approveToken(router,token,amount,account){
  let oldAllowance = await token.allowance(account.address,router.address)
  let decimals = await token.decimals()
  let amountWei = ethers.utils.parseEther(amount,decimals)

  await ( await token.connect(account).approve(router.address,amountWei) ).wait()

  let newAllowance = await token.allowance(account.address,router.address)
  let amountToAddWEI = ethers.utils.parseUnits(amount,decimals)

  // expect(oldAllowance.add(amountToAddWEI)).to.equal(newAllowance);
}

async function tokenMint(token,amount,to,owner){
  let oldBalance = await token.balanceOf(to)
  let decimals = await token.decimals()
  let amountWei = ethers.utils.parseEther(amount,decimals)

  await ( await token.connect(owner).mint(to,amountWei) ).wait()

  let newBalance = await token.balanceOf(to)
  let amountToAddWEI = ethers.utils.parseUnits(amount,decimals)

  expect(oldBalance.add(amountToAddWEI)).to.equal(newBalance);
}


module.exports = {
  initializeDummyTokens,
  initializeArdMoneyContracts,
  approveToken,
  tokenMint,
}
