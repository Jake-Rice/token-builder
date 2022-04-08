import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import Card from 'react-bootstrap/Card';
import TokenEntry from './TokenEntry';
import Dashboard from './Dashboard'

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

const DashboardCard = () => {
    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenData, setTokenData] = useState({
        accountAddress: '',
        balance: '',
        name: '',
        symbol: '',
        decimals: ''
    });

    const handleSubmit = async (addr) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const erc20 = new ethers.Contract(addr, abi, signer);

            const pUser = signer.getAddress();
            const pName = erc20.name();
            const pSymbol = erc20.symbol();
            const pDecimals = erc20.decimals();
            const [user, name, symbol, decimals] = await Promise.all([pUser, pName, pSymbol, pDecimals]);
            const balance = await erc20.balanceOf(user);
            
            setTokenData({
                accountAddress: user,
                balance: balance.toString(),
                name: name,
                symbol: symbol,
                decimals: decimals
            });
            setTokenAddress(addr);
        } catch (e) { 
            console.error(e);
            alert('Error: Token address invalid.');
        }
    }

    const handleReset = () => {
        setTokenAddress('');
    }

    return (
        <Card>
            {(tokenAddress==='') ? <TokenEntry submit={handleSubmit}/> : <Dashboard tokenAddress={tokenAddress} tokenData={tokenData} setTokenData={setTokenData} reset={handleReset}/>}
        </Card>
    )
}

export default DashboardCard