import React, { useState } from 'react';
import { ethers } from 'ethers';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const abi = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function transfer(address to, uint amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "event Transfer(address indexed from, address indexed to, uint amount)"
];

const TokenEntry = (props) => {

    const [tokenAddress, setTokenAddress] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        props.submit(tokenAddress);
    }

    return (
        <Form onSubmit={handleSubmit}>
            <div className="form-row"><label>Token Address</label><input type="text" value={tokenAddress} className="text-input" onChange={(event)=>setTokenAddress(event.target.value)}/></div>
            <div className="form-row btn-row"><Button variant="primary" onClick={handleSubmit}>Get Token</Button></div>
        </Form>
    )
}

export default TokenEntry;