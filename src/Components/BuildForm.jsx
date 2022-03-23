import React, { useState } from 'react';
import './buildForm.css';

const BuildForm = (props) => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const [decimals, setDecimals] = useState('');

  const submit = () => {
    props.onSubmit(name, symbol, supply, decimals);
  }
  return (
    <form>
        <div className="form-row"><label>Name</label><input type="text" className="text-input" value={name} onChange={(e)=>setName(e.target.value)}/></div>
        <div className="form-row"><label>Symbol</label><input type="text" className="text-input" value={symbol} onChange={(e)=>setSymbol(e.target.value)}/></div>
        <div className="form-row"><label>Initial Supply</label><input type="number" className="text-input" value={supply} onChange={(e)=>setSupply(e.target.value)}/></div>
        <div className="form-row"><label># of Decimal Places</label><input type="number" className="text-input" value={decimals} onChange={(e)=>setDecimals(e.target.value)}/></div>
        <div className="form-row btn-row"><input type="button" value="Create Token" className="btn" onClick={() => submit()}/></div>
    </form>
  )
}

export default BuildForm;