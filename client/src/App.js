import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import BuildForm from './Components/BuildForm';
import DashboardCard from './Components/DashboardCard'
import HelpModal from './Components/HelpModal'
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

function App() {
  const [web3, setWeb3] = useState({
  });

  const [tokenAddress, setTokenAddress] = useState('');
  const [inProgress, toggleInProgress] = useState(false);
  const [showModal, toggleModal] = useState(false);

  useEffect(async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setWeb3({
      provider: provider,
      signer: signer
    });
  }, []);

  const handleSubmit = async (name, symbol, supply, decimals, pausable) => {
    if (!inProgress) {
      try {
        toggleInProgress(true);

        const address = await web3.signer.getAddress();
        
        const res = await axios.post("https://jake-rice-token-builder.herokuapp.com/api"/*"http://localhost:3000/api"*/, {
          address: address,
          name: name,
          pausable: pausable
        });
        
        const contract = await deploy(res.data.abi, res.data.bytecode, name, symbol, supply, decimals);
        const tx = contract.deployTransaction;
        console.log("Contract Deployed to: " + contract.address);
        setTokenAddress(contract.address);
        const rx = await tx.wait();
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

  const showHelpModal = () => {
    toggleModal(true);
  }

  return (
    <div className="App">
      <h1 className="page-header">Token Builder</h1>
      <h2 className="page-sub-header">Build your own ERC20 token on the Ethereum blockchain!</h2>
      <Link to="/build"><Button variant="primary">Create A Token</Button></Link>
      <Link to="/dashboard"><Button variant="secondary">Token Dashboard</Button></Link>
      <Button variant="secondary" onClick={showHelpModal}>Help</Button>
      <div className="card-container">
        <Routes>
          <Route path="/" element={<></>}/>
          <Route path="/" element={<></>}/>
          <Route path="/build" element={<BuildForm onSubmit={handleSubmit} inProgress={inProgress}/>}/>
          <Route path="/dashboard" element={web3.signer ? <DashboardCard web3={web3} tokenAddress={tokenAddress} setTokenAddress={setTokenAddress} updateContract={handleUpdateContract} reset={handleReset}/> : <></>}/>
        </Routes>
      </div>
      <HelpModal showModal={showModal} toggleModal={toggleModal}/>
    </div>
  );
}

export default App;
