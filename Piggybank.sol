pragma solidity ^0.4.0;

contract PiggyBank {

    uint private balance;
    address public owner;

    function PiggyBank() public {
        owner = msg.sender;
        balance = 0;
    }

    function deposit() public payable returns (uint) {
        balance += msg.value;
        return balance;
    }

    function withdraw(uint withdrawAmount) public returns (uint remainingBal) {
        require(msg.sender == owner);
        balance -= withdrawAmount;

        msg.sender.transfer(withdrawAmount);

        return balance;
    }
}
