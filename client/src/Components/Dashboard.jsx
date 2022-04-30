import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers'
import './dashboard.css';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import abi from './abi'

const rxAddress = /^0x[a-fA-F0-9]{40}$/;

const Dashboard = (props) => {

    const [transferRecipient, setTransferRecipient] = useState('');
    const [transferAmount, setTransferAmount] = useState('');

    const [allowanceSpender, setAllowanceSpender] = useState('');
    const [allowanceAmount, setAllowanceAmount] = useState('');

    const [allowanceAvailable, setAllowanceAvailable] = useState('');
    const [validAllowance, setValidAllowance] = useState(false);

    const [claimOwner, setClaimOwner] = useState('');
    const [claimAmount, setClaimAmount] = useState('');
    const [sendAllowance, setSendAllowance] = useState(false);
    const [sendAddress, setSendAddress] = useState('');

    const [tokenData, setTokenData] = useState({
        address: '',
        name: '',
        symbol: '',
        decimals: '',
        paused: false
    });

    const [userData, setUserData] = useState({
        address: '',
        balance: ''
    });

    let filter1, filter2, filter3, filter4, filter5;

    const getTokenData = async () => {
        const address = props.web3.contract.address;
        const pName = props.web3.contract.name();
        const pSymbol = props.web3.contract.symbol();
        const pDecimals = props.web3.contract.decimals();
        const [name, symbol, decimals] = await Promise.all([pName, pSymbol, pDecimals]);
        let paused;
        try {
            paused = await props.web3.contract.paused();
        } catch (err) {
            paused = false;
        }
        
        setTokenData({
            address: address,
            name: name,
            symbol: symbol,
            decimals: decimals,
            paused: paused
        });
    }
    useEffect(() => {
        if (props.web3.contract) getTokenData();
        if (props.web3.signer) getUserData();
    }, [props.web3.signer, props.web3.contract]);

    const getUserData = async () => {
        const address = await props.web3.signer.getAddress();
        const balance = formatBalance((await props.web3.contract.balanceOf(address)).toString(), await props.web3.contract.decimals());
        setUserData({
            address: address,
            balance: balance
        })
    }

    const formatBalance = (balance, dec) => {
        if (dec === 0) return balance;
        let bal = balance;
        while (bal.length <= dec) bal = '0'+bal;
        bal = bal.slice(0,0-dec)+'.'+bal.slice(0-dec);
        while (bal[bal.length-1] === '0') bal = bal.slice(0,-1);
        if (bal[bal.length-1] === '.') bal = bal.slice(0,-1);
        return bal;
    }

    //============== Allowance Display ===============
    const updateAllowance = async () => {
        if (rxAddress.test(claimOwner)) {
            const decimals = await props.web3.contract.decimals();
            try {
                const _allowance = await props.web3.contract.allowance(claimOwner, userData.address);
                setAllowanceAvailable(formatBalance(_allowance.toString(), decimals));
                setValidAllowance(true);
            } catch(err) {
                console.error(err);
            }
        }
        else setValidAllowance(false);
    }
    useEffect(() => {
        updateAllowance();
    }, [claimOwner, userData.address]);

    useEffect(() => {
        const run = async () => {
            if (userData.address) {
                //Change allowance display if visible
                if (rxAddress.test(claimOwner)) {
                    const dec = await props.web3.contract.decimals();
                    const _allowance = await props.web3.contract.allowance(claimOwner, userData.address);
                    setAllowanceAvailable(formatBalance(_allowance.toString(), dec));
                }
            }
        }
        run();
    }, [userData.address, claimOwner]);
    //============= /Allowance Display ===============

    useEffect(() => {
        const run = async () => {
            if (userData.address!=='') {
                filter1 = props.web3.contract.filters.Transfer(userData.address);
                props.web3.contract.on(filter1, update);
                filter2 = props.web3.contract.filters.Transfer(null, userData.address);
                props.web3.contract.on(filter2, update);
                filter3 = props.web3.contract.filters.Approval(null, userData.address);
                props.web3.contract.on(filter3, update);
                filter4 = props.web3.contract.filters.Paused();
                props.web3.contract.on(filter4, getTokenData);
                filter5 = props.web3.contract.filters.Unpaused();
                props.web3.contract.on(filter5, getTokenData);
            }
        }
        run();
        return (() => {
            if (userData.address!=='' && props.web3.contract) {
                props.web3.contract.off(filter1, update);
                props.web3.contract.off(filter2, update);
                props.web3.contract.off(filter3, update);
                props.web3.contract.off(filter4, getTokenData);
                props.web3.contract.off(filter5, getTokenData);
            }
        })
    }, [userData.address]);
    const update = () => {
        getUserData();
        updateAllowance();
    }

    const transferTokens = async (recipient, amount) => {
        try {
            const decimals = await props.web3.contract.decimals();
            await props.web3.contract.transfer(recipient, parseAmount(amount, decimals));
        } catch (e) { 
            console.error(e);
            alert('Error: Transfer failed.');
        }
    }

    const setTokenAllowance = async (recipient, amount) => {
        try {
            const sender = await props.web3.signer.getAddress();
            const balance = await props.web3.contract.balanceOf(sender);
            const decimals = await props.web3.contract.decimals();
            if (balance >= formatBalance(amount, decimals)) {
                await props.web3.contract.approve(recipient, parseAmount(amount, decimals));
            }
            else alert("Error: Insufficient balance.")
        } catch (e) { 
            console.error(e);
            alert('Error: Allowance failed.');
        }
    }

    const transferAllowance = async (owner, recipient, amount) => {
        try {
            const balance = await props.web3.contract.balanceOf(owner);
            const decimals = await props.web3.contract.decimals();
            if (balance >= formatBalance(amount, decimals) ) {
                await props.web3.contract.transferFrom(owner, recipient, parseAmount(amount, decimals));
            }
        } catch (e) { 
            console.error(e);
            alert('Error: Transfer failed.');
        }
    }

    const pauseTransactions = async () => {
        try {
            await props.web3.contract.pause();
        } catch(err) {
            console.error(err);
            alert('Error: Pause failed.')
        }
    }

    const unPauseTransactions = async () => {
        try {
            await props.web3.contract.unpause();
        } catch(err) {
            console.error(err);
            alert('Error: Unpause failed.')
        }
    }

    const parseAmount = (amt, dec) => {
        let amount = amt;
        if (amount.indexOf('.') < 0) {
            for (let i=0; i<dec; i++) {
                amount=amount+'0';
            }
            return amount;
        }
        while (amount.length-amount.indexOf('.') <= dec) amount=amount+'0';
        if (amount.length-amount.indexOf('.') > dec+1) amount = amount.slice(0,amount.indexOf('.')+dec);
        return amount.slice(0,amount.indexOf('.'))+amount.slice(amount.indexOf('.')+1);
    }

    return (
        <Form>
            <h3>Token Dashboard</h3>
            <div className="form-row"><label>Token Address: {tokenData.address}</label></div>
            <div className="form-row"><label>Token Name: {tokenData.name}</label></div>
            <div className="form-row"><label>Token Symbol: {tokenData.symbol}</label></div>
            <div className="form-row"><label>Account Address: {userData.address}</label></div>
            <div className="form-row"><label>Token Balance: {userData.balance}</label></div>
            <div className="form-row"><label>Transfers Paused: {tokenData.paused ? "Yes" : "No"}</label></div>
            <hr/>
            <h3>Transfer Tokens</h3>
            <div className="form-row field-row">
                <label>Recipient</label>
                <input className="text-input" value={transferRecipient} onChange={(event)=>setTransferRecipient(event.target.value)}/><br/>
                <label>Amount</label>
                <input type="number" value={transferAmount} onChange={(event)=>setTransferAmount(event.target.value)}/>
                <Button size="sm" variant="danger" onClick={() => transferTokens(transferRecipient, transferAmount)}>Transfer</Button>
            </div>
            <hr/>
            <h3>Set Token Allowance</h3>
            <div className="form-row field-row">
                <label>Spender</label>
                <input className="text-input" value={allowanceSpender} onChange={(event)=>setAllowanceSpender(event.target.value)}/><br/>
                <label>Amount</label>
                <input type="number" value={allowanceAmount} onChange={(event)=>setAllowanceAmount(event.target.value)}/>
                <Button size="sm" variant="danger" onClick={() => setTokenAllowance(allowanceSpender, allowanceAmount)}>Set Allowance</Button>
            </div>
            <hr/>
            <h3>Claim Allowance</h3>
            <div className="form-row field-row">
                <label>Owner</label>
                <input className="text-input" value={claimOwner} onChange={(event)=>setClaimOwner(event.target.value)}/><br/>
                {validAllowance && <div><label>Available Allowance: {allowanceAvailable} {tokenData.symbol}</label><br/></div>}
                <label>Amount</label>
                <input type="number" value={claimAmount} onChange={(event)=>setClaimAmount(event.target.value)}/>
                <Button size="sm" variant="danger" onClick={() => transferAllowance(claimOwner, (sendAllowance ? sendAddress : userData.address), claimAmount)}>{sendAllowance ? "Send Allowance" : "Claim Allowance"}</Button>
                {/*<label><input type="checkbox" checked={sendAllowance} onChange={()=>setSendAllowance(!sendAllowance)}/> Send to another address</label>*/}
                {/*sendAllowance &&
                    <div>
                        <label>Destination address</label>
                        <input className="text-input" value={sendAddress} onChange={(event)=>setSendAddress(event.target.value)}/>
                    </div>*/}
            </div>
            <hr/>
        <h3>{tokenData.paused ? "Unpause" : "Pause"} Token Transfers</h3>
            <div className="form-row field-row">
                {tokenData.paused ? <Button size="sm" variant="danger" onClick={() => unPauseTransactions()}>Unpause</Button> :
                <Button size="sm" variant="danger" onClick={() => {pauseTransactions()}}>Pause</Button>}
            </div>
            <div className="form-row btn-row">
                <Link to="/dashboard">
                    <Button variant="secondary" onClick={props.reset}>Use a Different Token</Button>
                </Link>
            </div>
        </Form>
    )
}
export default Dashboard;