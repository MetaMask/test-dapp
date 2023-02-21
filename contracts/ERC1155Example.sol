// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ERC1155Example is ERC1155, Ownable {
    string public constant name = "ERC1155";

    constructor() ERC1155("ipfs://bafybeidxfmwycgzcp4v2togflpqh2gnibuexjy4m4qqwxp7nh3jx5zlh4y/") {
    }

    function uri(uint256 _tokenid) override public view returns (string memory) {
        return string(abi.encodePacked(super.uri(_tokenid), Strings.toString(_tokenid), ".json"));
    }


    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner{
        _mintBatch(to, ids, amounts, data);
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }
}