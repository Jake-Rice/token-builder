//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract CustomERC20 is ERC20, ERC20Detailed, ERC20Burnable {
    address owner;
    
    constructor(address _tokenOwner, _name, _symbol, _decimals) {
        owner = _tokenOwner; //passes ownership of token contract to address specified by TokenFactory
    }

    modifier OnlyOwner {
        require(msg.sender == owner, "Unauthorized: Not the owner account");
        _;
    }

    function mint(uint amount) public OnlyOwner {
        _mint(owner, amount);
    }
}
