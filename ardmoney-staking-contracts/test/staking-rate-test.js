const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parse18,format18 } = require("./helper");
const { deposit,withdraw,checkUserBalance,checkSupplyAndRate,sendReward } = require("./coreHelper");

describe("xARDMStaking", function () {

  beforeEach(async function () {
    let accounts = await ethers.getSigners()
    this.owner = accounts[0];
    this.odko = accounts[1];
    this.erhes = accounts[2];
    this.eegii = accounts[3];
    this.dex = accounts[4];

    MockToken = await ethers.getContractFactory("MockToken");
    this.ardmContract = await MockToken.deploy("ArdMoney","ARDM",18);
    await this.ardmContract.deployed();

    const XARDMStaking = await ethers.getContractFactory("XARDMStaking");
    this.xARDMStakingContract = await XARDMStaking.deploy(this.ardmContract.address);
    await this.xARDMStakingContract.deployed();

    this.xArdmAddress = await this.xARDMStakingContract.getXARDMAddress()
    this.xArdmContract = await ethers.getContractAt('XARDM',this.xArdmAddress);

    this.stakingAddress = this.xARDMStakingContract.address

    this.ardmContract.mint(this.odko.address,parse18(1000))
    this.ardmContract.mint(this.erhes.address,parse18(1000))
    this.ardmContract.mint(this.eegii.address,parse18(1000))
    this.ardmContract.mint(this.dex.address,parse18(5000))
  });

  // Odko - 500 ARDM , 500 xARDM
  // Erhes - 500 ARDM , 500 xARDM
  // Protocol - 2000 ARDM , 0 xARDM
  // Total ARDM - 1000
  // Total xARDM - 1000
  //
  // REWARD ADDED
  // -----
  // Odko - 500 ARDM , 500 xARDM
  // Erhes - 500 ARDM , 500 xARDM
  // Protocol - 1000 ARDM , 0 xARDM
  // Total ARDM - 2000
  // Total xARDM - 1000
  // xARDM Rate - 2
  //
  // Erhes Withdraw
  // -----
  // Odko - 500 ARDM , 500 xARDM
  // Erhes - 1500 ARDM , 0 xARDM
  // Protocol - 1000 ARDM , 0 xARDM
  // Total ARDM - 1000
  // Total xARDM - 500
  // xARDM Rate - 2
  //
  // Odko Withdraw
  // -----
  // Odko - 1500 ARDM , 0 xARDM
  // Erhes - 1500 ARDM , 0 xARDM
  // Protocol - 1000 ARDM , 0 xARDM
  // Total ARDM - 0
  // Total xARDM - 0
  // xARDM Rate - 0
  it("xARDMStaking Deposit Rate Change (Int) Flow - 2 Person - Even", async function () {
    // Odko Deposit 500 ARDM to Staking Contract
    await deposit(this,this.odko,500)
    await checkUserBalance(this,this.odko,"500.0","500.0")
    await checkSupplyAndRate(this,"500.0","500.0","1.0")

    // Erhes Deposit 500 ARDM to Staking Contract
    await deposit(this,this.erhes,500)
    await checkUserBalance(this,this.erhes,"500.0","500.0")
    await checkSupplyAndRate(this,"1000.0","1000.0","1.0")

    // DEX sends 1000 ARDM reward , now rate is 2 from 1
    await sendReward(this,this.dex,1000)
    await checkSupplyAndRate(this,"2000.0","1000.0","2.0")

    // Erhes Withdraw by burning 500xARDM and gaining 1000 ARDM
    await withdraw(this,this.erhes,500)
    await checkUserBalance(this,this.erhes,"1500.0","0.0")
    await checkSupplyAndRate(this,"1000.0","500.0","2.0")

    // Odko Withdraw by burning 500xARDM and gaining 1000 ARDM
    await withdraw(this,this.odko,500)
    await checkUserBalance(this,this.odko,"1500.0","0.0")
    await checkSupplyAndRate(this,"0.0","0.0","0.0")
  });

  it("xARDMStaking Deposit Rate Change (Int) Flow - 3 Person - Odd", async function () {
    // Odko Deposit 500 ARDM to Staking Contract
    await deposit(this,this.odko,500)
    await checkUserBalance(this,this.odko,"500.0","500.0")
    await checkSupplyAndRate(this,"500.0","500.0","1.0")

    // Erhes Deposit 500 ARDM to Staking Contract
    await deposit(this,this.erhes,500)
    await checkUserBalance(this,this.erhes,"500.0","500.0")
    await checkSupplyAndRate(this,"1000.0","1000.0","1.0")

    // Eegii Deposit 500 ARDM to Staking Contract
    await deposit(this,this.eegii,500)
    await checkUserBalance(this,this.eegii,"500.0","500.0")
    await checkSupplyAndRate(this,"1500.0","1500.0","1.0")

    // DEX sends 1000 ARDM reward , now rate is 2 from 1
    await sendReward(this,this.dex,1000)
    await checkSupplyAndRate(this,"2500.0","1500.0","1.666666666666666666")

    // Erhes Withdraw by burning 500xARDM and gaining 1000 ARDM
    await withdraw(this,this.erhes,500)
    await checkUserBalance(this,this.erhes,"1333.333333333333333333","0.0")
    await checkSupplyAndRate(this,"1666.666666666666666667","1000.0","1.666666666666666666")

    // Odko Withdraw by burning 500xARDM and gaining 1000 ARDM
    await withdraw(this,this.odko,500)
    await checkUserBalance(this,this.erhes,"1333.333333333333333333","0.0")
    await checkSupplyAndRate(this,"833.333333333333333334","500.0","1.666666666666666666")

    // Eegii Withdraw by burning 500xARDM and gaining 1000 ARDM
    await withdraw(this,this.eegii,500)
    await checkUserBalance(this,this.erhes,"1333.333333333333333333","0.0")
    await checkSupplyAndRate(this,"0.0","0.0","0.0")

  });

  it("xARDMStaking Deposit Rate Change (Int) Flow - 3 Person - even", async function () {
    // Odko Deposit 500 ARDM to Staking Contract
    await deposit(this,this.odko,600)
    await checkUserBalance(this,this.odko,"400.0","600.0")
    await checkSupplyAndRate(this,"600.0","600.0","1.0")

    // Erhes Deposit 500 ARDM to Staking Contract
    await deposit(this,this.erhes,600)
    await checkUserBalance(this,this.erhes,"400.0","600.0")
    await checkSupplyAndRate(this,"1200.0","1200.0","1.0")

    // Eegii Deposit 500 ARDM to Staking Contract
    await deposit(this,this.eegii,600)
    await checkUserBalance(this,this.eegii,"400.0","600.0")
    await checkSupplyAndRate(this,"1800.0","1800.0","1.0")

    // DEX sends 1000 ARDM reward , rate 1.55 => 1
    await sendReward(this,this.dex,1000)
    await checkSupplyAndRate(this,"2800.0","1800.0","1.555555555555555555")

    // Erhes Withdraw by burning 600 xARDM and gaining 1333 ARDM
    await withdraw(this,this.erhes,600)
    await checkUserBalance(this,this.erhes,"1333.333333333333333333","0.0")
    await checkSupplyAndRate(this,"1866.666666666666666667","1200.0","1.555555555555555555")

    // Odko Withdraw by burning 500xARDM and gaining 1312 ARDM
    await withdraw(this,this.odko,600)
    await checkUserBalance(this,this.odko,"1333.333333333333333333","0.0")
    await checkSupplyAndRate(this,"933.333333333333333334","600.0","1.555555555555555555")

    // Eegii Withdraw by burning 600xARDM and gaining 1375 ARDM
    await withdraw(this,this.eegii,600)
    await checkUserBalance(this,this.eegii,"1333.333333333333333334","0.0")
    await checkSupplyAndRate(this,"0.0","0.0","0.0")

  });

  it("xARDMStaking Deposit Rate Change (Int) Flow - 3 Person - 1 gave more ARDM", async function () {
    // Odko Deposit 500 ARDM to Staking Contract
    await deposit(this,this.odko,500)
    await checkUserBalance(this,this.odko,"500.0","500.0")
    await checkSupplyAndRate(this,"500.0","500.0","1.0")

    // Erhes Deposit 500 ARDM to Staking Contract
    await deposit(this,this.erhes,500)
    await checkUserBalance(this,this.erhes,"500.0","500.0")
    await checkSupplyAndRate(this,"1000.0","1000.0","1.0")

    // Eegii Deposit 500 ARDM to Staking Contract
    await deposit(this,this.eegii,600)
    await checkUserBalance(this,this.eegii,"400.0","600.0")
    await checkSupplyAndRate(this,"1600.0","1600.0","1.0")

    // DEX sends 1000 ARDM reward , now rate is 1.625 from 1
    await sendReward(this,this.dex,1000)
    await checkSupplyAndRate(this,"2600.0","1600.0","1.625")

    // Erhes Withdraw by burning 500xARDM and gaining 812.5 ARDM
    await withdraw(this,this.erhes,500)
    await checkUserBalance(this,this.erhes,"1312.5","0.0")
    await checkSupplyAndRate(this,"1787.5","1100.0","1.625")

    // Odko Withdraw by burning 500xARDM and gaining 1312 ARDM
    await withdraw(this,this.odko,500)
    await checkUserBalance(this,this.erhes,"1312.5","0.0")
    await checkSupplyAndRate(this,"975.0","600.0","1.625")

    // Eegii Withdraw by burning 600xARDM and gaining 1375 ARDM
    await withdraw(this,this.eegii,600)
    await checkUserBalance(this,this.eegii,"1375.0","0.0")
    await checkSupplyAndRate(this,"0.0","0.0","0.0")

  });

});

