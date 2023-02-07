// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import 'base64-sol/base64.sol';

contract TestDappCollectibles is ERC721 {
  
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() ERC721('TestDappCollectibles', 'TDC') {}

  function mintCollectibles(uint numberOfTokens) public {
    for(uint i = 1; i <= numberOfTokens; i++) {
      _tokenIds.increment();
      uint tokenId = _tokenIds.current();
      _safeMint(_msgSender(), tokenId);
    }
  }

  function tokenURI(uint tokenId) public pure override returns (string memory) {
    string memory svg = 
    '<svg height="350" width="350" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">'
    '<defs>'
    '<path id="MyPath" fill="none" stroke="red" '
    'd="M10,90 Q90,90 90,45 Q90,10 50,10 Q10,10 10,40 Q10,70 45,70 Q70,70 75,50" />'
    '</defs>'
    '<text>'
    '<textPath href="#MyPath">'
    'Quick brown fox jumps over the lazy dog.'
    '</textPath>'
    '</text>'
    '</svg>';

    string memory json = string(
      abi.encodePacked(
        '{"name": "Test Dapp Collectibles #',
        Strings.toString(tokenId), 
        '", "description": "Test Dapp Collectibles for testing.", "image": "data:image/svg+xml;base64,',
        Base64.encode(bytes(svg)),
        '", "attributes": [{"trait_type": "Token Id", "value": "',
        Strings.toString(tokenId), 
        '"}]}'
      )
    );

    string memory uri = string(
      abi.encodePacked(
        "data:application/json;base64,", Base64.encode(bytes(json))
      )
    );

    return uri;
  }
}
