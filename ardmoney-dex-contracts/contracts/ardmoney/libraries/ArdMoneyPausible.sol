// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (security/Pausable.sol)

pragma solidity =0.6.12;

import "./ArdMoneyContext.sol";

contract ArdMoneyPausable is ArdMoneyContext {
    event Paused(address account);
    event Unpaused(address account);

    bool private _paused;

    constructor() public {
        _paused = false;
    }

    function paused() public view virtual returns (bool) {
        return _paused;
    }

    modifier whenNotPaused() {
        require(!paused(), "PAUSED");
        _;
    }

    modifier whenPaused() {
        require(paused(), "NOT PAUSED");
        _;
    }

    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}
