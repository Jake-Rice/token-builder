const abi = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function paused() view returns (bool)", //only available if Pausable
    "function transfer(address to, uint amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function pause() returns (bool)", //only available if Pausable
    "function unpause() returns (bool)", //only available if Pausable
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "event Transfer(address indexed from, address indexed to, uint amount)",
    "event Paused(address account)", //only available if Pausable
    "event Unpaused(address account)" //only available if Pausable
];

export default abi;