import React from 'react';
import './buildForm.css';

const BuildForm = () => {
  return (
    <form>
        <div className="form-row"><label>Name</label><input type="text" className="text-input"/></div>
        <div className="form-row"><label>Symbol</label><input type="text" className="text-input"/></div>
        <div className="form-row"><label>Initial Supply</label><input type="number" className="text-input"/></div>
        <div className="form-row"><label># of Decimal Places</label><input type="number" className="text-input"/></div>
        <div className="form-row"><label>Enable owner to mint additional tokens</label><input type="checkbox"/></div>
        <div className="form-row"><label>Cap supply at Initial Supply limit</label><input type="checkbox"/></div>
        <div className="form-row"><label>Enable owner to pause all transactions</label><input type="checkbox"/></div>
        <div className="form-row btn-row"><input type="button" value="Create Token" className="btn"/></div>
    </form>
  )
}

export default BuildForm;