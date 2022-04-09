import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers'
import './dashboard.css';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'

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
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const erc20 = new ethers.Contract(props.tokenAddress, abi, signer);
        const filter = erc20.filters.Transfer(signer.address);
        erc20.on(filter, async (from, to, amount, event) => {
            props.setTokenData({...props.tokenData, balance: await erc20.balanceOf(props.tokenData.accountAddress)});
        });
        return (()=>{
            erc20.removeAllListeners();
        });
    }, []);

    useEffect(async () => {
        if (/^0x[a-fA-F0-9]{40}$/.test(claimOwner)) {
            console.log("match");
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const erc20 = new ethers.Contract(props.tokenAddress, abi, signer);
            const decimals = await erc20.decimals();
            try {
                const _allowance = await erc20.allowance(claimOwner, await signer.getAddress());
                setAllowanceAvailable(formatBalance(_allowance.toString(), decimals));
                setValidAllowance(true);
            } catch(err) {
                console.error(err);
            }
        }
        else setValidAllowance(false);
    }, [claimOwner]);

    const transferTokens = async (recipient, amount) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const erc20 = new ethers.Contract(props.tokenAddress, abi, signer);
            const sender = await signer.getAddress();
            const balance = await erc20.balanceOf(sender);
            const decimals = await erc20.decimals();
            const success = await erc20.transfer(recipient, parseAmount(amount, decimals));
            console.log(success);
        } catch (e) { 
            console.error(e);
            alert('Error: Transfer failed.');
        }
    }

    const setTokenAllowance = async (recipient, amount) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const erc20 = new ethers.Contract(props.tokenAddress, abi, signer);
            const sender = await signer.getAddress();
            const balance = await erc20.balanceOf(sender);
            const decimals = await erc20.decimals();
            let success = false;
            if (balance.gte(parseAmount(amount, decimals))) {
                success = await erc20.approve(recipient, parseAmount(amount, decimals));
            }
            else alert("Error: Insufficient balance.")
            const allowance = await erc20.allowance(sender, recipient);
        } catch (e) { 
            console.error(e);
            alert('Error: Allowance failed.');
        }
    }

    const transferAllowance = async (owner, recipient, amount) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const erc20 = new ethers.Contract(props.tokenAddress, abi, signer);
            const spender = await signer.getAddress();
            const balance = await erc20.balanceOf(owner);
            const allowance = await erc20.allowance(owner, spender)
            const decimals = await erc20.decimals();
            let success = false;
            if (balance >= parseAmount(amount, decimals) ) {
                success = await erc20.transferFrom(owner, recipient, parseAmount(amount, decimals));
            }
            console.log(success);
        } catch (e) { 
            console.error(e);
            alert('Error: Transfer failed.');
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
            <h3>Token Info</h3>
            <div className="form-row"><label>Token Address: {props.tokenAddress}</label></div>
            <div className="form-row"><label>Token Name: {props.tokenData.name}</label></div>
            <div className="form-row"><label>Token Symbol: {props.tokenData.symbol}</label></div>
            <div className="form-row"><label>Account Address: {props.tokenData.accountAddress}</label></div>
            <div className="form-row"><label>Token Balance: {formatBalance(props.tokenData.balance.toString(), props.tokenData.decimals)} {props.tokenData.symbol}</label></div>
            <h3>Transfer Tokens</h3>
            <div className="form-row">
                <label>Recipient</label>
                <input className="text-input" value={transferRecipient} onChange={(event)=>setTransferRecipient(event.target.value)}/><br/>
                <label>Amount</label>
                <input type="number" value={transferAmount} onChange={(event)=>setTransferAmount(event.target.value)}/>
                <Button size="sm" variant="danger" onClick={() => transferTokens(transferRecipient, transferAmount)}>Transfer</Button>
            </div>
            <h3>Set Token Allowance</h3>
            <div className="form-row">
                <label>Spender</label>
                <input className="text-input" value={allowanceSpender} onChange={(event)=>setAllowanceSpender(event.target.value)}/><br/>
                <label>Amount</label>
                <input type="number" value={allowanceAmount} onChange={(event)=>setAllowanceAmount(event.target.value)}/>
                <Button size="sm" variant="danger" onClick={() => setTokenAllowance(allowanceSpender, allowanceAmount)}>Set Allowance</Button>
            </div>
            <h3>Claim Allowance</h3>
            <div className="form-row">
                <label>Owner</label>
                <input className="text-input" value={claimOwner} onChange={(event)=>setClaimOwner(event.target.value)}/><br/>
                {validAllowance && <><label>Available Allowance: {allowanceAvailable.toString()}</label><br/></>}
                <label>Amount</label>
                <input type="number" value={claimAmount} onChange={(event)=>setClaimAmount(event.target.value)}/>
                <Button size="sm" variant="danger" onClick={() => transferAllowance(claimOwner, (sendAllowance ? sendAddress : props.tokenData.accountAddress), claimAmount)}>{sendAllowance ? "Send Allowance" : "Claim Allowance"}</Button>
                <label><input type="checkbox" checked={sendAllowance} onChange={()=>setSendAllowance(!sendAllowance)}/> Send to another address</label>
                {sendAllowance &&
                    <div>
                        <label>Destination address</label>
                        <input className="text-input" value={sendAddress} onChange={(event)=>setSendAddress(event.target.value)}/>
                    </div>}
            </div>
            <div className="form-row btn-row">
                <Link to="/token-builder/dashboard">
                    <Button variant="secondary" onClick={props.reset}>Use a Different Token</Button>
                </Link>
            </div>
        </Form>
    )
}
export default Dashboard;