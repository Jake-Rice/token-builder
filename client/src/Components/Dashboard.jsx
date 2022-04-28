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

    useEffect(async () => {
        if (rxAddress.test(claimOwner)) {
            const decimals = await props.web3.contract.decimals();
            try {
                const _allowance = await props.web3.contract.allowance(claimOwner, await props.web3.signer.getAddress());
                setAllowanceAvailable(formatBalance(_allowance.toString(), decimals));
                setValidAllowance(true);
            } catch(err) {
                console.error(err);
            }
        }
        else setValidAllowance(false);
    }, [claimOwner]);

    useEffect(() => {
        props.web3.contract.removeAllListeners();
        return (()=>{
            props.web3.contract.removeAllListeners();
        });
    }, []);

    useEffect(() => {
        const run = async () => {
            if (props.tokenData.accountAddress) {
                //Change allowance display if visible
                if (rxAddress.test(claimOwner)) {
                    const dec = await props.web3.contract.decimals();
                    const _allowance = await props.web3.contract.allowance(claimOwner, props.tokenData.accountAddress);
                    setAllowanceAvailable(formatBalance(_allowance.toString(), dec));
                }
                // transfer()
                const filter = props.web3.contract.filters.Transfer(props.tokenData.accountAddress);
                props.web3.contract.on(filter, async (from, to, amount, event) => {
                    const bal = await props.web3.contract.balanceOf(props.tokenData.accountAddress);
                    props.updateTokenData({...props.tokenData, balance: bal.toString()});
                });
                // transferFrom()
                const filter2 = props.web3.contract.filters.Transfer(null, props.tokenData.accountAddress);
                props.web3.contract.on(filter2, async (from, to, amount, event) => {
                    const bal = await props.web3.contract.balanceOf(props.tokenData.accountAddress);
                    const dec = await props.web3.contract.decimals();
                    props.updateTokenData({...props.tokenData, balance: bal.toString()});
                    const _allowance = await props.web3.contract.allowance(from, to);
                    setAllowanceAvailable(formatBalance(_allowance.toString(), dec));
                });
                // approve()
                const filter3 = props.web3.contract.filters.Approval(null, props.tokenData.accountAddress);
                props.web3.contract.on(filter3, async (from, to, amount, event) => {
                    //TODO: run only if approving address == claimOwner
                    if (from === claimOwner) {
                        const dec = await props.web3.contract.decimals();
                        const _allowance = await props.web3.contract.allowance(from, to);
                        setAllowanceAvailable(formatBalance(_allowance.toString(), dec));
                    }
                });
                // pause()
                const filter4 = props.web3.contract.filters.Paused();
                props.web3.contract.on(filter4, async () => {
                    props.updateTokenData({...props.tokenData, paused: true});
                });
                // unpause()
                const filter5 = props.web3.contract.filters.Unpaused();
                props.web3.contract.on(filter5, async () => {
                    props.updateTokenData({...props.tokenData, paused: false});
                });
            }
        }
        run();
        return (()=>{
            props.web3.contract.removeAllListeners();
        });
    }, [props.tokenData.accountAddress]);

    useEffect(async () => {
        const erc20 = new ethers.Contract(props.tokenAddress, abi, props.web3.signer)
        const pUser = props.web3.signer.getAddress();
        const pName = erc20.name();
        const pSymbol = erc20.symbol();
        const pDecimals = erc20.decimals();
        const pPaused = erc20.paused();
        const [user, name, symbol, decimals, paused] = await Promise.all([pUser, pName, pSymbol, pDecimals, pPaused]);
        const balance = await erc20.balanceOf(user);
        props.updateTokenData({
            accountAddress: user,
            balance: balance.toString(),
            name: name,
            symbol: symbol,
            decimals: decimals,
            paused: paused
        });
        props.web3.provider.provider.on("accountsChanged", async () => {
            const signer = props.web3.provider.getSigner();
            const pUser = signer.getAddress();
            const pName = props.web3.contract.name();
            const pSymbol = props.web3.contract.symbol();
            const pDecimals = props.web3.contract.decimals();
            const pPaused = erc20.paused();
            const [user, name, symbol, decimals, paused] = await Promise.all([pUser, pName, pSymbol, pDecimals, pPaused]);
            const balance = await props.web3.contract.balanceOf(user);
            props.updateTokenData({
                accountAddress: user,
                balance: balance.toString(),
                name: name,
                symbol: symbol,
                decimals: decimals,
                paused: paused
            });
        });
    }, []);

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

    const formatBalance = (balance, dec) => {
        if (dec === 0) return balance;
        let bal = balance;
        while (bal.length <= dec) bal = '0'+bal;
        bal = bal.slice(0,0-dec)+'.'+bal.slice(0-dec);
        while (bal[bal.length-1] === '0') bal = bal.slice(0,-1);
        if (bal[bal.length-1] === '.') bal = bal.slice(0,-1);
        return bal;
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
            <div className="form-row"><label>Token Address: {props.tokenAddress}</label></div>
            <div className="form-row"><label>Token Name: {props.tokenData.name}</label></div>
            <div className="form-row"><label>Token Symbol: {props.tokenData.symbol}</label></div>
            <div className="form-row"><label>Account Address: {props.tokenData.accountAddress}</label></div>
            <div className="form-row"><label>Token Balance: {formatBalance(props.tokenData.balance.toString(), props.tokenData.decimals)} {props.tokenData.symbol}</label></div>
            <div className="form-row"><label>Transfers Paused: {props.tokenData.paused ? "Yes" : "No"}</label></div>
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
                {validAllowance && <div><label>Available Allowance: {allowanceAvailable} {props.tokenData.symbol}</label><br/></div>}
                <label>Amount</label>
                <input type="number" value={claimAmount} onChange={(event)=>setClaimAmount(event.target.value)}/>
                <Button size="sm" variant="danger" onClick={() => transferAllowance(claimOwner, (sendAllowance ? sendAddress : props.tokenData.accountAddress), claimAmount)}>{sendAllowance ? "Send Allowance" : "Claim Allowance"}</Button>
                {/*<label><input type="checkbox" checked={sendAllowance} onChange={()=>setSendAllowance(!sendAllowance)}/> Send to another address</label>*/}
                {/*sendAllowance &&
                    <div>
                        <label>Destination address</label>
                        <input className="text-input" value={sendAddress} onChange={(event)=>setSendAddress(event.target.value)}/>
                    </div>*/}
            </div>
            <hr/>
        <h3>{props.tokenData.paused ? "Unpause" : "Pause"} Token Transfers</h3>
            <div className="form-row field-row">
                {props.tokenData.paused ? <Button size="sm" variant="danger" onClick={() => unPauseTransactions()}>Unpause</Button> :
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