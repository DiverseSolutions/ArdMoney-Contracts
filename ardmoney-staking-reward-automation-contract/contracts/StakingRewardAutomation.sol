// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IArdMoneyStakingContract.sol";

contract StakingRewardAutomation is AccessControl {
  IArdMoneyStakingContract public stakingContract;
  IERC20 public ardmToken;
  address public registryAddress;
  uint public percentage;

  event SentReward(address indexed stakingAddress, uint amount);
  // TODO stakingContractUpdated , ardmTokenUpdated , registeryAddressUpdated Events

  constructor(address ardmAddress, address _stakingContract,address _registeryAddress , uint _percentage) {
    ardmToken = IERC20(ardmAddress);
    stakingContract = IArdMoneyStakingContract(_stakingContract);
    registryAddress = _registeryAddress;
    percentage = _percentage;

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function sendReward() external onlyRegistery() {
    uint totalStakingARDM = stakingContract.getTotalLockedARDM();
    uint _amount = (totalStakingARDM * percentage) / 100000000000000000000;

    bool result = ardmToken.transferFrom(address(this),address(stakingContract),_amount);
    require(result,"TRANSFER FAILED");

    emit SentReward(address(stakingContract),_amount);
  }

  function sendRewardAdmin() external onlyRole(DEFAULT_ADMIN_ROLE) {
    uint totalStakingARDM = stakingContract.getTotalLockedARDM();
    uint _amount = (totalStakingARDM * percentage) / 100000000000000000000;

    bool result = ardmToken.transferFrom(address(this),address(stakingContract),_amount);
    require(result,"TRANSFER FAILED");

    emit SentReward(address(stakingContract),_amount);
  }

  function getRewardRate() external view returns(uint){
    uint totalStakingARDM = stakingContract.getTotalLockedARDM();
    uint _amount = (totalStakingARDM * percentage) / 100000000000000000000;
    return _amount;
  }

  function updatePercentage(uint _percentage) external onlyRole(DEFAULT_ADMIN_ROLE){
    percentage = _percentage;
  }

  // TODO updateStakingContract , updateARDMToken , updateRegisteryAddress functions
  // TODO fire events

  modifier onlyRegistery(){
    require(msg.sender == registryAddress,"NOT REGISTERY");
    _;
  }

}
