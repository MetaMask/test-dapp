// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// Used to test Paid by MetaMask on a sponsored network.
/// `burn` writes one storage slot per iteration and succeeds.
contract SponsorshipProbe {
    mapping(uint256 => uint256) public slots;

    function burn(uint256 iterations) external {
        for (uint256 i = 0; i < iterations; i++) {
            slots[i] = i + 1;
        }
    }
}
