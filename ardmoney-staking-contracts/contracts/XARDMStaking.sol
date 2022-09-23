// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./XARDM.sol";

contract XARDMStaking is Ownable {
    IERC20 public ARDM;
    XARDM public xARDM;

    bool public withdrawPaused;
    bool public depositPaused;

    event DepositPaused(bool state);
    event WithdrawPaused(bool state);

    event Deposit(address user,uint amount,uint xAmount);
    event Withdraw(address user,uint amount,uint xAmount);

    constructor(IERC20 _ARDM) {
        ARDM = _ARDM;
        xARDM = new XARDM(msg.sender,address(this));

        withdrawPaused = false;
        depositPaused = false;
    }

    function deposit(uint256 _amount) whenDepositNotPaused external {
        uint256 totalARDM = ARDM.balanceOf(address(this));
        uint256 totalxARDM = xARDM.totalSupply();

        if (totalxARDM == 0 || totalARDM == 0) {
            xARDM.mint(msg.sender, _amount);
            emit Deposit(msg.sender,_amount,_amount);
        }
        else {
            uint256 mintAmount = (_amount * totalxARDM) / totalARDM;
            xARDM.mint(msg.sender, mintAmount);
            emit Deposit(msg.sender,_amount,mintAmount);
        }
        ARDM.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint256 _amount) whenWithdrawNotPaused external {
        uint256 totalARDM = ARDM.balanceOf(address(this));
        uint256 totalxARDM = xARDM.totalSupply();

        uint256 transferAmount = (_amount * totalARDM) / totalxARDM;

        xARDM.burnFrom(msg.sender,_amount);
        ARDM.transfer(msg.sender, transferAmount);
        emit Withdraw(msg.sender,transferAmount,_amount);
    }

    function getXARDMAddress() view external returns (address){
      return address(xARDM);
    }

    function getXARDMRate() view external returns (uint){
      uint256 totalARDM = ARDM.balanceOf(address(this));
      uint256 totalxARDM = xARDM.totalSupply();

      if(totalARDM == 0 || totalxARDM == 0){
        return 0;
      }

      return (1000000000000000000 * totalARDM) / totalxARDM;
    }

    function getXARDMAmountRate(uint _amount) view external returns (uint){
      uint256 totalARDM = ARDM.balanceOf(address(this));
      uint256 totalxARDM = xARDM.totalSupply();

      return (_amount * totalxARDM) / totalARDM;
    }

    function getTotalLockedARDM() view external returns (uint){
      uint256 totalARDM = ARDM.balanceOf(address(this));
      return totalARDM;
    }

    function toggleWithdrawPause() onlyOwner() external {
      withdrawPaused = !withdrawPaused;
      emit WithdrawPaused(withdrawPaused);
    }

    function toggleDepositPause() onlyOwner() external {
      depositPaused = !depositPaused;
      emit DepositPaused(depositPaused);
    }

    modifier whenDepositNotPaused() {
        require(!depositPaused, "ArdMoney: Deposit Paused");
        _;
    }

    modifier whenWithdrawNotPaused() {
        require(!withdrawPaused, "ArdMoney: Withdraw Paused");
        _;
    }
}
