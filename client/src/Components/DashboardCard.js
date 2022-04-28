import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import Card from 'react-bootstrap/Card';
import TokenEntry from './TokenEntry';
import Dashboard from './Dashboard'
import abi from './abi'

const DashboardCard = (props) => {
    const [tokenData, setTokenData] = useState({
        accountAddress: '',
        balance: '',
        name: '',
        symbol: '',
        decimals: '',
        paused: false
    });

    const handleSubmit = async (addr) => {
        try {
            const erc20 = new ethers.Contract(addr, abi, props.web3.signer)
            props.updateContract(erc20);
            const pUser = props.web3.signer.getAddress();
            const pName = erc20.name();
            const pSymbol = erc20.symbol();
            const pDecimals = erc20.decimals();
            const pPaused = erc20.paused();
            const [user, name, symbol, decimals, paused] = await Promise.all([pUser, pName, pSymbol, pDecimals, pPaused]);
            const balance = await erc20.balanceOf(user);
            setTokenData({
                accountAddress: user,
                balance: balance.toString(),
                name: name,
                symbol: symbol,
                decimals: decimals,
                paused: paused
            });
            props.setTokenAddress(addr);
        } catch (e) { 
            console.error(e);
            alert('Error: Token address invalid.');
        }
    }

    const updateTokenData = (data) => {
        setTokenData(data);
    }

    return (
        <Card className="card card-app">
            {(props.tokenAddress==='') ? <TokenEntry submit={handleSubmit}/> : <Dashboard web3={props.web3} tokenAddress={props.tokenAddress} tokenData={tokenData} updateTokenData={updateTokenData} reset={props.reset}/>}
        </Card>
    )
}

export default DashboardCard