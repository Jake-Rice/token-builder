import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import Card from 'react-bootstrap/Card';
import TokenEntry from './TokenEntry';
import Dashboard from './Dashboard'
import abi from './abi'

const DashboardCard = (props) => {
    const handleSubmit = (addr) => {
        try {
            props.updateContract(addr);
        } catch (e) { 
            console.error(e);
            alert('Error: Token address invalid.');
        }
    }

    const handleReset = () => {
        props.reset();
    }

    return (
        <Card className="card card-app">
            {(props.web3.contract) ? <Dashboard web3={props.web3} reset={handleReset}/> : <TokenEntry submit={handleSubmit}/>}
        </Card>
    )
}

export default DashboardCard