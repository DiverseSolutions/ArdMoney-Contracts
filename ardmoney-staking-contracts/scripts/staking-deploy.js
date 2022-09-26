const path = require('path');

async function main() {
  let ardMoneyAddress = "0x2D9ee688D46FD1D39Eb3507BB58dCE3A3cab64D0"

  const XARDMStaking = await ethers.getContractFactory("XARDMStaking");
  const xARDMStakingContract = await XARDMStaking.deploy(ardMoneyAddress);
  await xARDMStakingContract.deployed();

  let xArdmAddress = await xARDMStakingContract.getXARDMAddress()

  console.log("xARDMStakingContract deployed to:", xARDMStakingContract.address);
  console.log("xARDM deployed to:", xArdmAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
