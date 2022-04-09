import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import Card from 'react-bootstrap/Card';
import TokenEntry from './TokenEntry';
import Dashboard from './Dashboard'
import abi from './abi'

const DashboardCard = (props) => {

    useEffect(() => {
        if (props.tokenAddress!=='') {
            handleSubmit(props.tokenAddress);
        }
    }, []);

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
            props.setTokenAddress(addr);
            props.setTokenData({
                accountAddress: user,
                balance: balance.toString(),
                name: name,
                symbol: symbol,
                decimals: decimals
            });
        } catch (e) { 
            console.error(e);
            alert('Error: Token address invalid.');
        }
    }

    return (
        <Card>
            {(props.tokenAddress==='') ? <TokenEntry submit={handleSubmit}/> : <Dashboard tokenAddress={props.tokenAddress} tokenData={props.tokenData} setTokenData={props.setTokenData} reset={props.reset}/>}
        </Card>
    )
}

export default DashboardCard