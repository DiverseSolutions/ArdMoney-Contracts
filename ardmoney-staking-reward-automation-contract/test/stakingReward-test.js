const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');

describe("StakingRewardAutomation - Flow Test", function () {

    beforeEach(async function() {
        let accounts = await ethers.getSigners();
        this.owner = accounts[0]
        let ardmTokenAddress = "0x2D9ee688D46FD1D39Eb3507BB58dCE3A3cab64D0"
        let stakingContractAddress = "0xb68EBb0Cd8247829072A24724259b6ED42FF18f2"
        let registryAddress = "0x02777053d6764996e594c3E88AF1D58D5363a2e6"
        let apy = new BigNumber(7.9)
        let weeks = new BigNumber(52)
        let percentageBN = apy.dividedBy(weeks)
        this.StakingRewardAutomation = await ethers.getContractFactory("StakingRewardAutomation");
        this.stakingRewardAutomationContract = await this.StakingRewardAutomation.deploy(
            ardmTokenAddress,
            stakingContractAddress,
            registryAddress,
            ethers.utils.parseEther(percentageBN.toNumber().toFixed(5))
        );
        await this.stakingRewardAutomationContract.deployed();  
    })
    
    // it("Send reward automated- Test", async function() {
    //     // NOT DONE YET
    //     // testing sendReward() function
    //     this.registryAddress = await this.stakingRewardAutomationContract.registryAddress();
    //     const sentReward = await this.stakingRewardAutomationContract.connect(this.registryAddress).sendReward();
    //     await sentReward.wait();

    // })

    // it("Send reward as Admin - Test", async function() {
    //     // NOT DONE YET
    //     // testing sendRewardAdmin() function
    //     const sentRewardAdmin = await this.stakingRewardAutomationContract.connect(this.owner).sendRewardAdmin();
    //     await sentRewardAdmin.wait();
    //     console.log(sentRewardAdmin)
    // })

    it("Update Percentage - Test", async function () {
        // changing apy and testing new percentage
        let newApy = new BigNumber(8.9)
        let weeks = new BigNumber(52)
        let newPercentageBN = newApy.dividedBy(weeks)
        const updatedPercentage = await this.stakingRewardAutomationContract.updatePercentage(
            ethers.utils.parseEther(newPercentageBN.toNumber().toFixed(5))
        )
        await updatedPercentage.wait();
        expect(await this.stakingRewardAutomationContract.percentage()).to.not.equal(0,1519);
    })
    
    it("Update Staking Contract Address - Test", async function () {
        // changing staking contract address and testing
        let newStakingContract = await this.stakingRewardAutomationContract.updateStakingContract(
            "0xcdc95Bfa6f864c438f2c90D1a448DAc32a555016"
        )
        await newStakingContract.wait();
        expect(await this.stakingRewardAutomationContract.stakingContract()).to.equal("0xcdc95Bfa6f864c438f2c90D1a448DAc32a555016")
    })

    it("Update ARDMToken Address - Test", async function () {
        // changing ardmoney token contract and testing
        const newARDMToken = await this.stakingRewardAutomationContract.updateARDMToken(
            "0x6f426CB1d703cef3927D4add149B2b3a7E36Ffea"
        )
        // console.log(newARDMToken)
        await newARDMToken.wait();
        expect(await this.stakingRewardAutomationContract.ardmToken()).to.equal("0x6f426CB1d703cef3927D4add149B2b3a7E36Ffea")
    })

    it("Update Registery - Test", async function () {
        // changing registry address and testing
        const newRegistryAddress = await this.stakingRewardAutomationContract.updateRegistryAddress(
            "0xF7ABEC94fC6d28cfd3036b8E2Db394225F882592"
        )
        // console.log(newRegistryAddress)
        await newRegistryAddress.wait();
        expect(await this.stakingRewardAutomationContract.registryAddress()).to.equal("0xF7ABEC94fC6d28cfd3036b8E2Db394225F882592")
    })










});
