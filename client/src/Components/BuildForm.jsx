import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './buildForm.css';

const MAX_STRING_LENGTH = 250; //actual limit 292 for name;

const BuildForm = (props) => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const [decimals, setDecimals] = useState('');
  
  const submit = (event) => {
    event.preventDefault();
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

  const enterSupply = (e) => {
    if (e.target.value.match(/(^\d*\.?\d*[0-9]+\d*$)|(^[0-9]+\d*\.\d*$)/) || e.target.value==='') {
      setSupply(e.target.value);
    }
    else if (e.target.value===".") {
      setSupply('0.');
    }
  }

  const enterDecimals = (e) => {
    if (e.target.value.match(/^([0-9]|[1-6][0-9]|7[0-7])$/) || e.target.value==='') {
      setDecimals(e.target.value);
    }
  }

  return (
    <Card className="card card-app">
      <Form>
        <h3>Create A Token</h3>
        <div className="form-row"><label>Name</label><input type="text" className="text-input" maxLength={MAX_STRING_LENGTH} value={name} onChange={(e)=>setName(e.target.value)}/></div>
        <div className="form-row"><label>Symbol</label><input type="text" className="text-input" maxLength={MAX_STRING_LENGTH} value={symbol} onChange={(e)=>setSymbol(e.target.value)}/></div>
        <div className="form-row"><label>Initial Supply</label><input type="text" inputMode="numeric" className="text-input" value={supply} onChange={enterSupply}/></div>
        <div className="form-row"><label># of Decimal Places</label><input type="text" inputMode="numeric" className="text-input" value={decimals} onChange={enterDecimals}/></div>
        <div className="form-row btn-row"><Button variant="primary" onClick={submit}>Create Token</Button></div>
        {props.inProgress && <div>Please Wait: Token Creation In Progress...</div>}
      </Form>
    </Card>
  )
}

export default BuildForm;