// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IArdMoneyStakingContract.sol";

contract StakingRewardAutomation is AccessControl, Pausable {
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  IArdMoneyStakingContract public stakingContract;
  IERC20 public ardmToken;
  address public registryAddress;
  uint public percentage;

  event SentReward(address indexed stakingAddress, uint amount);
  event stakingContractUpdated(address indexed stakingContractUpdated);
  event ardmTokenUpdated(address indexed ardmTokenUpdated);
  event registryAddressUpdated(address indexed registryAddress);
  event percentageUpdated(address indexed percentageUpdated);
  constructor(address ardmAddress, address _stakingContract,address _registryAddress , uint _percentage) {
    ardmToken = IERC20(ardmAddress);
    stakingContract = IArdMoneyStakingContract(_stakingContract);
    registryAddress = _registryAddress;
    percentage = _percentage;
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(PAUSER_ROLE, msg.sender);
  }
  
  function sendReward() external onlyRegistry whenNotPaused{
    uint totalStakingARDM = stakingContract.getTotalLockedARDM();
    uint _amount = (totalStakingARDM * percentage) / 100000000000000000000;
    ardmToken.approve(address(this), _amount);
    bool result = ardmToken.transferFrom(address(this),address(stakingContract),_amount);
    require(result,"TRANSFER FAILED");

    emit SentReward(address(stakingContract),_amount);
  }

  function sendRewardAdmin() external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
    uint totalStakingARDM = stakingContract.getTotalLockedARDM();
    uint _amount = (totalStakingARDM * percentage) / 100000000000000000000;
    ardmToken.approve(address(this), _amount);
    bool result = ardmToken.transferFrom(address(this),address(stakingContract),_amount);
    require(result,"TRANSFER FAILED");

    emit SentReward(address(stakingContract),_amount);
  }

  function getRewardRate() external view returns(uint){
    uint totalStakingARDM = stakingContract.getTotalLockedARDM();
    uint _amount = (totalStakingARDM * percentage) / 100000000000000000000;
    return _amount;
  }

  function getBalance() external view returns(uint){
    return IERC20(address(ardmToken)).balanceOf(address(this)); 
  }

  function updatePercentage(uint _percentage) external onlyRole(DEFAULT_ADMIN_ROLE){
    percentage = _percentage;
  }

  function updateStakingContract(address _stakingContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
    stakingContract = IArdMoneyStakingContract(_stakingContract);
  }

  function updateARDMToken(address _ardmToken) external onlyRole(DEFAULT_ADMIN_ROLE) {
    ardmToken = IERC20(_ardmToken);
  }

  function updateRegistryAddress(address _registryAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
    registryAddress = _registryAddress;
  }

  modifier onlyRegistry(){
    require(msg.sender == registryAddress,"NOT REGISTRY");
    _;
  }

  function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

  function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
  // override, super.beforeTokenTransfer removed cause of error

  function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        
  {
      _beforeTokenTransfer(from, to, amount);
  }
}
