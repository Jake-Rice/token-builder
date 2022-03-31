import React, { useState } from 'react';
import { ethers } from 'ethers'
import './dashboard.css';
import Button from 'react-bootstrap/Button'

const Dashboard = (props) => {
    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenAddressVerified, toggleTokenAddressVerified] = useState(false);
    
    const [tokenData, setTokenData] = useState({
        tokenAddress: '',
        accountAddress: '',
        balance: '',
        name: '',
        symbol: '',
        decimals: ''
    });

    const [transferRecipient, setTransferRecipient] = useState('');
    const [transferAmount, setTransferAmount] = useState('');

    const [allowanceSpender, setAllowanceSpender] = useState('');
    const [allowanceAmount, setAllowanceAmount] = useState('');

    const [claimOwner, setClaimOwner] = useState('');
    const [claimAmount, setClaimAmount] = useState('');
    const [sendAllowance, setSendAllowance] = useState(false);

    const verifyTokenAddress = async (addr) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const abi = [
                "function balanceOf(address owner) view returns (uint256)",
                "function decimals() view returns (uint8)",
                "function name() view returns (string)",
                "function symbol() view returns (string)",
                "function transfer(address to, uint amount) returns (bool)",
                "event Transfer(address indexed from, address indexed to, uint amount)"
            ];
            const erc20 = new ethers.Contract(addr, abi, signer);
            const user = await signer.getAddress();
            const balance = await erc20.balanceOf(user);
            const name = await erc20.name();
            const symbol = await erc20.symbol();
            const decimals = await erc20.decimals();
            setTokenData({
                tokenAddress: addr,
                accountAddress: user,
                balance: balance.toString(),
                name: name,
                symbol: symbol,
                decimals: decimals
            });
            toggleTokenAddressVerified(true);
        } catch (e) { 
            console.error(e);
            alert('Error: Token address invalid.');
        }
    }

    const formatBalance = (balance, dec) => {
        let bal = balance;
        while (bal.length <= dec) bal = '0'+bal;
        bal = bal.slice(0,-dec)+'.'+bal.slice(-dec);
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
        <div>
            {tokenAddressVerified ?
                <form>
                    <h3>Token Info</h3>
                    <div className="form-row"><label>Token Address: {tokenData.tokenAddress}</label></div>
                    <div className="form-row"><label>Token Name: {tokenData.name}</label></div>
                    <div className="form-row"><label>Token Symbol: {tokenData.symbol}</label></div>
                    <div className="form-row"><label>Account Address: {tokenData.accountAddress}</label></div>
                    <div className="form-row"><label>Token Balance: {formatBalance(tokenData.balance.toString(), tokenData.decimals)} {tokenData.symbol}</label></div>
                    <h3>Transfer Tokens</h3>
                    <div className="form-row">
                        <label>Recipient</label>
                        <input className="text-input" value={transferRecipient} onChange={(event)=>setTransferRecipient(event.target.value)}/><br/>
                        <label>Amount</label>
                        <input type="number" value={transferAmount} onChange={(event)=>setTransferAmount(event.target.value)}/>
                        <input type="button" value="Transfer"/>
                    </div>
                    <h3>Set Token Allowance</h3>
                    <div className="form-row">
                        <label>Spender</label>
                        <input className="text-input" value={allowanceSpender} onChange={(event)=>setAllowanceSpender(event.target.value)}/><br/>
                        <label>Amount</label>
                        <input type="number" value={allowanceAmount} onChange={(event)=>setAllowanceAmount(event.target.value)}/>
                        <input type="button" value="Set Allowance"/>
                    </div>
                    <h3>Claim Allowance</h3>
                    <div className="form-row">
                        <label>Owner</label>
                        <input className="text-input" value={claimOwner} onChange={(event)=>setClaimOwner(event.target.value)}/><br/>
                        <label>Amount</label>
                        <input type="number" value={claimAmount} onChange={(event)=>setClaimAmount(event.target.value)}/><br/>
                        <label>Send to another address</label>
                        <input type="checkbox" checked={sendAllowance} onChange={()=>setSendAllowance(!sendAllowance)}/>
                        <input type="button" value="Claim Allowance"/>
                    </div>
                    <div className="form-row btn-row"><Button variant="primary" onClick={() => {
                        setTokenAddress('');
                        toggleTokenAddressVerified(false);
                    }}>Get Token</Button></div>
                </form>
                :
                <form>
                    <div className="form-row"><label>Token Address</label><input type="text" value={tokenAddress} className="text-input" onChange={(event)=>setTokenAddress(event.target.value)}/></div>
                    <div className="form-row btn-row"><Button variant="primary" onClick={() => verifyTokenAddress(tokenAddress)}>Get Token</Button></div>
                </form>
            }
        </div>
    );
}
export default Dashboard;