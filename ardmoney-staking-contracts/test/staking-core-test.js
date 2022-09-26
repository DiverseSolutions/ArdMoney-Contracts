const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parse18,format18 } = require("./helper");

describe("xARDMStaking", function () {

  beforeEach(async function () {
    let accounts = await ethers.getSigners()
    this.owner = accounts[0];
    this.odko = accounts[1];
    this.erhes = accounts[2];
    this.dex = accounts[3];

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
    this.ardmContract.mint(this.dex.address,parse18(5000))
  });

  it("xARDMStaking Deposit Flow", async function () {
    // await expect(this.xARDMStakingContract.connect(this.odko).deposit(parse18(500))).to.emit(this.xARDMStakingContract, "Deposit")
    
    // Odko Deposit 500 ARDM to Staking Contract
    await this.ardmContract.connect(this.odko).approve(this.stakingAddress,parse18(500))
    await this.xARDMStakingContract.connect(this.odko).deposit(parse18(500))

    expect(await this.ardmContract.balanceOf(this.odko.address)).to.equal(parse18(500));
    expect(await this.xArdmContract.balanceOf(this.odko.address)).to.equal(parse18(500));

    expect(await this.xARDMStakingContract.ardmBalanceOf(this.odko.address)).to.equal(parse18(500));
    expect(await this.xARDMStakingContract.getXARDMRate()).to.equal(parse18(1));
    expect(await this.xARDMStakingContract.getTotalLockedARDM()).to.equal(parse18(500));
  });

  it("xARDMStaking Deposit Event Fired", async function () {
    await this.ardmContract.connect(this.odko).approve(this.stakingAddress,parse18(500))
    await expect(this.xARDMStakingContract.connect(this.odko).deposit(parse18(500))).to.emit(this.xARDMStakingContract, "Deposit")
  });

  it("xARDMStaking Withdraw Flow", async function () {
    // Odko Deposit 500 ARDM to Staking Contract
    await this.ardmContract.connect(this.odko).approve(this.stakingAddress,parse18(500))
    await this.xARDMStakingContract.connect(this.odko).deposit(parse18(500))

    await this.xArdmContract.connect(this.odko).approve(this.stakingAddress,parse18(500))
    await this.xARDMStakingContract.connect(this.odko).withdraw(parse18(500))

    expect(await this.xARDMStakingContract.ardmBalanceOf(this.odko.address)).to.equal(parse18(0));
    expect(await this.ardmContract.balanceOf(this.odko.address)).to.equal(parse18(1000));
    expect(await this.xArdmContract.balanceOf(this.odko.address)).to.equal(parse18(0));
    expect(await this.xARDMStakingContract.getXARDMRate()).to.equal(0);
    expect(await this.xARDMStakingContract.getTotalLockedARDM()).to.equal(parse18(0));
  });

  it("xARDMStaking Withdraw Event Fired", async function () {
    await this.ardmContract.connect(this.odko).approve(this.stakingAddress,parse18(500))
    await this.xARDMStakingContract.connect(this.odko).deposit(parse18(500))

    await this.xArdmContract.connect(this.odko).approve(this.stakingAddress,parse18(500))
    await expect(this.xARDMStakingContract.connect(this.odko).withdraw(parse18(500))).to.emit(this.xARDMStakingContract, "Withdraw")
  });

  it("Deposit Pause", async function () {
    await expect(this.xARDMStakingContract.toggleDepositPause())
      .to.emit(this.xARDMStakingContract, "DepositPaused")
      .withArgs(true)
    await this.xARDMStakingContract.toggleDepositPause();
    await this.xARDMStakingContract.toggleDepositPause();

    await this.ardmContract.connect(this.odko).approve(this.stakingAddress,parse18(500))
    await expect(this.xARDMStakingContract.connect(this.odko).deposit(parse18(500)))
      .to.be.revertedWith("ArdMoney: Deposit Paused")

    await this.xARDMStakingContract.toggleDepositPause();

    await this.ardmContract.connect(this.odko).approve(this.stakingAddress,parse18(500))
    await expect(this.xARDMStakingContract.connect(this.odko).deposit(parse18(500)))
      .not.to.be.reverted;
  });

  it("Withdraw Pause", async function () {
    await expect(this.xARDMStakingContract.toggleWithdrawPause())
      .to.emit(this.xARDMStakingContract, "WithdrawPaused")
      .withArgs(true)
    await this.xARDMStakingContract.toggleWithdrawPause();
    await this.xARDMStakingContract.toggleWithdrawPause();

    await this.xArdmContract.connect(this.odko).approve(this.stakingAddress,parse18(500))
    await expect(this.xARDMStakingContract.connect(this.odko).withdraw(parse18(500)))
      .to.emit(this.xARDMStakingContract, "Withdraw")
      .to.be.revertedWith("ArdMoney: Withdraw Paused")

    await this.xARDMStakingContract.toggleWithdrawPause();

    await this.ardmContract.connect(this.odko).approve(this.stakingAddress,parse18(500))
    await this.xARDMStakingContract.connect(this.odko).deposit(parse18(500))

    await this.xArdmContract.connect(this.odko).approve(this.stakingAddress,parse18(500))
    await expect(this.xARDMStakingContract.connect(this.odko).withdraw(parse18(500)))
      .not.to.be.reverted;
  });

});

