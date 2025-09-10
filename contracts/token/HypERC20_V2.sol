// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import {HypERC20} from "./HypERC20.sol";

contract HypERC20_V2 is HypERC20 {
    mapping(address => bool) private _whitelisted;

    function version() public pure returns (uint8) {
        return 2;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(
        uint8 __decimals,
        uint256 _scale,
        address _mailbox
    ) HypERC20(__decimals, _scale, _mailbox) {
        _disableInitializers();
    }

    /// @custom:oz-upgrades-unsafe-allow missing-initializer-call
    function initializeV2(
        address[] calldata whitelistedAddresses_
    ) external reinitializer(2) {
        for (uint256 i = 0; i < whitelistedAddresses_.length; i++) {
            _whitelisted[whitelistedAddresses_[i]] = true;
        }
    }

    // (Consider access control — owner-only, etc.)
    function addWhitelisted(address walletAddress_) public virtual {
        _whitelisted[walletAddress_] = true;
    }

    function isWhitelisted(
        address walletAddress_
    ) public view virtual returns (bool) {
        return _whitelisted[walletAddress_];
    }

    function _transfer(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        require(_whitelisted[from], "NOT_WHITELISTED");
        super._transfer(from, to, value);
    }
}
