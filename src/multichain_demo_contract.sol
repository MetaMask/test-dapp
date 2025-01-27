// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RestrictedWithdrawal {
    address public owner;
    mapping(address => bool) public allowedAddresses;
    uint256 public allowedCount;

    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);
    event AllowedAddressUpdated(address indexed addr, bool allowed);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAllowed() {
        require(allowedAddresses[msg.sender], "Not allowed to withdraw");
        _;
    }

    constructor(address[] memory initialAllowedAddresses) {
        owner = msg.sender;
        for (uint256 i = 0; i < initialAllowedAddresses.length; i++) {
            allowedAddresses[initialAllowedAddresses[i]] = true;
        }
        allowedCount = initialAllowedAddresses.length;
    }

    receive() external payable {
      emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external onlyAllowed {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    function updateAllowedAddress(address addr, bool allowed) external onlyOwner {
        if (allowed && !allowedAddresses[addr]) {
            allowedCount++;
        } else if (!allowed && allowedAddresses[addr]) {
            allowedCount--;
        }
        allowedAddresses[addr] = allowed;
        emit AllowedAddressUpdated(addr, allowed);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
