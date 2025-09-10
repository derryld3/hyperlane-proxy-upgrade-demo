// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import {HypERC20} from "./HypERC20.sol";

contract HypERC20_V2 is HypERC20 {

    // TODO add whitelistAddresses variable (set)

    constructor(
        uint8 _decimals,
        uint256 _scale,
        address _mailbox
    ) HypERC20(_decimals, _scale, _mailbox) {
    }

    // TODO implement addWhitelist function

    // TODO identify which transfer function to override, the goal is sender must be whitelisted
}
