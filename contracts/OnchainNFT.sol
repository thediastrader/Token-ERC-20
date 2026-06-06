// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract OnchainNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("OnchainNFT", "ONFT") Ownable(msg.sender) {}

    function mint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name": "OnchainNFT #', Strings.toString(tokenId), '",',
            '"description": "NFT com metadados 100% onchain",',
            '"attributes": [{"trait_type": "Builder", "value": "TheDias"}]}'
        ))));

        return string(abi.encodePacked("data:application/json;base64,", json));
    }
}