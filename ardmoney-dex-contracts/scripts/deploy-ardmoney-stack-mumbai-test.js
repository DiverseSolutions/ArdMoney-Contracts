const path = require('path');
const hre = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();
  const wrappedMatic = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889"
  // 100% == 1000 || 3% == 30 || 0.3% == 3
  const swapFee = 3;
  const mintFee = 3;

  const Factory = await hre.ethers.getContractFactory("ArdMoneyFactory");
  const factoryContract = await Factory.deploy(owner.address);

  const Router = await hre.ethers.getContractFactory("ArdMoneyRouter");
  const routerContract = await Router.deploy(factoryContract.address,wrappedMatic,owner.address,swapFee,mintFee);

  await factoryContract.deployed();
  await routerContract.deployed();

  console.log("factoryContract deployed to:", factoryContract.address);
  console.log("routerContract deployed to:", routerContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


