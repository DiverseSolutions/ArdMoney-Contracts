// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IArdMoneyStakingContract {
    function getTotalLockedARDM() external view returns (uint256);

    function getXARDMRate() external view returns (uint256);
    function getXARDMAddress() external view returns (address);

    function version() external pure returns (string memory);
}
