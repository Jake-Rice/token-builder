//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract CustomERC20 is ERC20, ERC20Burnable {
    address public owner;
    uint8 private dec;
    bool public mintable;
    
    constructor(address _tokenOwner, uint256 _initialSupply, string memory _name, string memory _symbol, uint8 _decimals, bool _mintable) ERC20(_name, _symbol) {
        owner = _tokenOwner; //passes ownership of token contract to address specified by TokenFactory
        dec = _decimals;
        mintable = _mintable;
        _mint(owner, _initialSupply);
    }

    modifier OnlyOwner {
        require(msg.sender == owner, "Unauthorized: Not the owner account");
        _;
    }

    //allows owner to mint additional tokens to the owner address
    function mint(uint256 amount) public OnlyOwner {
        require(mintable, "Unauthorized: Minting not allowed");
        _mint(owner, amount);
    }

    //allows owner to mint additional tokens to any non-zero address
    function mintTo(address account, uint256 amount) public OnlyOwner {
        require(mintable, "Unauthorized: Minting not allowed");
        _mint(account, amount);
    }

    function decimals() public view override returns (uint8) {
        return dec;
    }
}
