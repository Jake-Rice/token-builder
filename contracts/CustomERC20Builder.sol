//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CustomERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CustomERC20Builder is Ownable {
    event TokenDeployment(address builderAddress, address tokenAddress);

    function buildERC20(address _tokenOwner, uint256 _initialSupply, string calldata _name, string calldata _symbol, uint8 _decimals) public {
        CustomERC20 token = new CustomERC20(_tokenOwner, _initialSupply, _name, _symbol, _decimals);
        emit TokenDeployment(address(this), address(token));
    }
}