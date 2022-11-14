const BigNumber = require('bignumber.js');

async function main() {
  let ardmTokenAddress = "0x2D9ee688D46FD1D39Eb3507BB58dCE3A3cab64D0"
  let stakingContractAddress = "0xb68EBb0Cd8247829072A24724259b6ED42FF18f2"
  let registeryAddress = "0x02777053d6764996e594c3E88AF1D58D5363a2e6"
  let apy = new BigNumber(7.9)
  let weeks = new BigNumber(52)
  let percentageBN = apy.dividedBy(weeks)

  const contract = await ethers.getContractFactory("StakingRewardAutomation");
  const stakingRewardAutomationContract = await contract.deploy(
    ardmTokenAddress,
    stakingContractAddress,
    registeryAddress,
    ethers.utils.parseEther(percentageBN.toNumber().toFixed(5))
  );
  await stakingRewardAutomationContract.deployed();

  console.log("Staking Reward Automation Contract - ",stakingRewardAutomationContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
