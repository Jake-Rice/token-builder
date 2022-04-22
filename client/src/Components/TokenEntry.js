import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const TokenEntry = (props) => {

    const [tokenAddress, setTokenAddress] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        props.submit(tokenAddress);
    }

    return (
        <Form onSubmit={handleSubmit}>
            <h3>Token Dashboard</h3>
            <div className="form-row"><label>Token Address</label><input type="text" value={tokenAddress} className="text-input" onChange={(event)=>setTokenAddress(event.target.value)}/></div>
            <div className="form-row btn-row"><Button variant="primary" onClick={handleSubmit}>Get Token</Button></div>
        </Form>
    )
}

export default TokenEntry;