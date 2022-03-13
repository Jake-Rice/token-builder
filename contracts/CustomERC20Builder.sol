//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CustomERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CustomERC20Builder is Ownable {
    uint256 public price;
    event TokenDeployment(address builderAddress, address tokenAddress);

    constructor() {
        price = 0.001 ether;
    }

    function buildERC20(address _tokenOwner, uint256 _initialSupply, string calldata _name, string calldata _symbol, uint8 _decimals) public payable {
        require(msg.value >= price, "Error: Insufficient payment");
        CustomERC20 token = new CustomERC20(_tokenOwner, _initialSupply, _name, _symbol, _decimals);
        emit TokenDeployment(address(this), address(token));
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public onlyOwner {
        (bool sent, bytes memory data) = owner().call{value: address(this).balance}("");
        require(sent, "transaction failed");
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    receive() external payable {}
    fallback() external payable {}
}