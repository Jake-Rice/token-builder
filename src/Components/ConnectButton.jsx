import React from 'react'

const ConnectButton = (props) => {
    const connect = () => {
        props.onConnect(true);
    }
    return (
        <input type="button" value="Connect MetaMask" onClick={connect}/>
    )
}

export default ConnectButton