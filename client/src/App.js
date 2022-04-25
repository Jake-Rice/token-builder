import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import BuildForm from './Components/BuildForm.jsx';
import DashboardCard from './Components/DashboardCard'
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

function App() {
  const [web3, setWeb3] = useState({
  });

  const [tokenAddress, setTokenAddress] = useState('');
  const [inProgress, toggleInProgress] = useState(false);

  useEffect(async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setWeb3({
      provider: provider,
      signer: signer
    });
  }, []);

  const handleSubmit = async (name, symbol, supply, decimals) => {
    if (!inProgress) {
      try {
        toggleInProgress(true);

        const address = await web3.signer.getAddress();
        
        const res = await axios.post(/*"https://jake-rice-token-builder.herokuapp.com/api"*/"http://localhost:3000/api", {
          address: address,
          name: name
        });
        
        const contract = await deploy(res.data.abi, res.data.bytecode, name, symbol, supply, decimals);
        const tx = contract.deployTransaction;
        console.log(contract.address);``
        setTokenAddress(contract.address);
        const rx = await tx.wait();
        console.log(rx);
        setWeb3({
          ...web3,
          contract: contract
        });
        toggleInProgress(false);
        navigate("/dashboard");
      } catch (e) {
        toggleInProgress(false);
        setTimeout(() => alert("Error: token not created\n"+ e.message), 100);
      }
    }
  }

  const deploy = async (abi, bytecode, ...args) => {
    const factory = new ethers.ContractFactory(abi, bytecode, web3.signer);
    const contract = await factory.deploy(...args);
    return contract;
  }

  const navigate = useNavigate();

  const handleReset = () => {
    setTokenAddress('');
  }

  const handleUpdateContract = (contract) => {
    setWeb3({...web3, contract: contract});
  }

  return (
    <div className="App">
      <h1>Token Builder</h1>
      <h2>Build your own ERC20 token on the Ethereum (Rinkeby) blockchain!</h2>
      <Link to="/build"><Button variant="primary">Create A Token</Button></Link>
      <Link to="/dashboard"><Button variant="secondary">Token Dashboard</Button></Link>
      <div className="card-container">
        <Routes>
          <Route path="/" element={<></>}/>
          <Route path="/" element={<></>}/>
          <Route path="/build" element={<BuildForm onSubmit={handleSubmit} inProgress={inProgress}/>}/>
          <Route path="/dashboard" element={web3.signer ? <DashboardCard web3={web3} tokenAddress={tokenAddress} setTokenAddress={setTokenAddress} updateContract={handleUpdateContract} reset={handleReset}/> : <></>}/>
        </Routes>
        <div className="instructions-container card card-info">
          <h3 className="instructions-section-header">Creating A Token</h3>
          <ol className="instructions-list">
            <li>Make sure you have Metamask installed on your browser.</li>
            <li>Set Metamask to the Rinkeby Ethereum Test Network.</li>
            <li>Get some test ETH from a faucet like <a href="http://faucets.chain.link/rinkeby" target="_blank">Chainlink</a></li>
            <li>Connect your Metamask account to this website.</li>
            <li>Click the "Create A Token" button.</li>
            <li>Enter the Name, Symbol and Initial Supply of your token.</li>
            <li>Enter the number of decimal places your token can be divided into.</li>
            <li>Click the "Create Token" button at the bottom of the form.</li>
            <li>Approve the transaction in Metamask to pay the fee and gas for token deployment.</li>
          </ol>
          <h3 className="instructions-section-header">Using The Token Dashboard</h3>
          <ol className="instructions-list">
            <li>Make sure you have Metamask installed on your browser.</li>
            <li>Click the "Token Dashboard" button above.</li>
            <li>Enter the contract address for the ERC20 token you want to use.</li>
            <li>Click the "Get Token" button.</li>
            <li>If the address points to a valid ERC20 token, the token details will appear.</li>
          </ol>
          <h4 className="instructions-function-header">Transfer Tokens</h4>
          <ol className="instructions-list">
            <li>Enter Recipient (the address you are sending your tokens to).</li>
            <li>Enter Amount (the number of tokens you are sending to the Recipient).</li>
            <li>Click the "Transfer" button.</li>
            <li>Approve the transaction in Metamask and pay the necessary gas.</li>
            <li>Your balance shown in the dashboard will update once the transaction is added to the blockchain.</li>
          </ol>
          <h4 className="instructions-function-header">Set Token Allowance</h4>
          <ol className="instructions-list">
            <li>This function allows another address to spend your tokens (or transfer the tokens to their own address).</li>
            <li>Enter Spender (the address you are authorizing to spend your tokens).</li>
            <li>Enter Amount (the number of tokens you are authorizing the Spender to spend).</li>
            <li>Click the "Set Allowance" button.</li>
            <li>Approve the transaction in Metamask and pay the necessary gas.</li>
            <li>Once the transaction is added to the blockchain, the Spender address will have access to the approved Amount of your tokens.</li>
          </ol>
          <h4 className="instructions-function-header">Claim Allowance</h4>
          <ol className="instructions-list">
            <li>This function transfers tokens to your account from an address that has approved an allowance to you.</li>
            <li>Enter Owner (the address you are claiming tokens from).</li>
            <li>If the address is valid, the allowance the Owner has approved for your address will be shown.</li>
            <li>Enter Amount (the number of tokens you are claiming).</li>
            <li>Click the "Claim Allowance" button.</li>
            <li>Approve the transaction in Metamask and pay the necessary gas.</li>
            <li>Once the transaction is added to the blockchain, the tokens will be in your account, and the allowance from the Owner will be reduced</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default App;
