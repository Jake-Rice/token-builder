import React, { useState } from 'react';
import './dashboard.css';
import Button from 'react-bootstrap/Button'

const Dashboard = (props) => {
    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenAddressVerified, toggleTokenAddressVerified] = useState(false);
    
    const [transferRecipient, setTransferRecipient] = useState('');
    const [transferAmount, setTransferAmount] = useState('');

    const [allowanceSpender, setAllowanceSpender] = useState('');
    const [allowanceAmount, setAllowanceAmount] = useState('');

    const [claimOwner, setClaimOwner] = useState('');
    const [claimAmount, setClaimAmount] = useState('');
    const [sendAllowance, setSendAllowance] = useState(false);

    return (
        <div>
            {tokenAddressVerified ?
                <form>
                    <div className="form-row"><label>Token Address: {tokenAddress}</label></div>
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
                    <div className="form-row btn-row"><Button variant="primary" onClick={() => toggleTokenAddressVerified(true)}>Get Token</Button></div>
                </form>
            }
        </div>
    );
}
export default Dashboard;