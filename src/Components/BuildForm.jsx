import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './buildForm.css';

const BuildForm = (props) => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const [decimals, setDecimals] = useState('');
  
  const submit = () => {
    props.onSubmit(name, symbol, parseAmount(supply, decimals), decimals);
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
        <div className="form-row"><label>Name</label><input type="text" className="text-input" value={name} onChange={(e)=>setName(e.target.value)}/></div>
        <div className="form-row"><label>Symbol</label><input type="text" className="text-input" value={symbol} onChange={(e)=>setSymbol(e.target.value)}/></div>
        <div className="form-row"><label>Initial Supply</label><input type="number" className="text-input" value={supply} onChange={(e)=>setSupply(e.target.value)}/></div>
        <div className="form-row"><label># of Decimal Places</label><input type="number" className="text-input" value={decimals} onChange={(e)=>setDecimals(e.target.value)}/></div>
        <div className="form-row btn-row"><Button variant="primary" onClick={() => submit()}>Create Token</Button></div>
        {props.inProgress && <div>Please Wait: Token Creation In Progress...</div>}
    </Form>
  )
}

export default BuildForm;