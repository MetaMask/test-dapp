// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts@4.8.2/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.8.2/access/Ownable.sol";
import "@openzeppelin/contracts@4.8.2/token/ERC20/extensions/draft-ERC20Permit.sol";

contract MyToken is ERC20, Ownable, ERC20Permit {

    constructor(uint256 initialAmount, string memory tokenName, uint8 decimalUnits, string memory tokenSymbol) ERC20(tokenName, tokenSymbol, decimalUnits) ERC20Permit(tokenName) {
        _mint(msg.sender, initialAmount * 10 ** decimals);
    }    

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}