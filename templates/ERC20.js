module.exports.code = (contractName, pausable) => {
    const header = 
`//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;`;
    let imports =
`import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";`;
    let declaration = 
`contract ${contractName} is ERC20, ERC20Burnable, Ownable {`
    let functions =`
    uint8 public dec;
    
    constructor(string memory _name, string memory _symbol, uint256 _initialSupply, uint8 _decimals) ERC20(_name, _symbol) {
        dec = _decimals;
        _mint(owner(), _initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return dec;
    }`

    if (pausable) {
        declaration = declaration.slice(0, -2) + ", Pausable" + declaration.slice(-2);
        imports += `
import "@openzeppelin/contracts/security/Pausable.sol";`;
        functions += `

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }`;
    }

    let contractCode = header + "\n\n" + imports + "\n\n" + declaration + functions + `
}`;
    return contractCode;
}
