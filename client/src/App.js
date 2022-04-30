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
import abi from './Components/abi';

function App() {
  const [web3, setWeb3] = useState({
  });

  const [tokenAddress, setTokenAddress] = useState('');
  const [inProgress, toggleInProgress] = useState(false);
  const [showModal, toggleModal] = useState(false);

  useEffect(() => {
    const run = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      setWeb3({
        provider: provider,
        signer: signer
      });
    }
    run();
  }, []);

  useEffect(() => {
    if (web3.provider) {
      web3.provider.provider.on("accountsChanged", async () => {
        setWeb3({ ...web3, signer: web3.provider.getSigner() });
      });
    }
    return (() => {
      if (web3.provider) {
        web3.provider.provider.removeAllListeners();
      }
    })
  }, [web3])

  const handleBuild = async (name, symbol, supply, decimals, pausable) => {
    if (!inProgress) {
      try {
        toggleInProgress(true);

        const address = await web3.signer.getAddress();
        
        const res = await axios.post(/*"https://jake-rice-token-builder.herokuapp.com/api"*/"http://localhost:3000/api", {
          address: address,
          name: name,
          pausable: pausable
        });
        
        const contract = await deploy(res.data.abi, res.data.bytecode, name, symbol, supply, decimals);
        const tx = contract.deployTransaction;
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
    setWeb3({
      ...web3,
      contract: null
    });
  }

  const handleUpdateContract = (addr) => {
    if (web3.contract) web3.contract.removeAllListeners();
    const contract = new ethers.Contract(addr, abi, web3.signer);
    setWeb3({...web3, contract: contract});
  }

  const showHelpModal = () => {
    toggleModal(true);
  }

  const formatBalance = (balance, dec) => {
    if (dec === 0) return balance;
    let bal = balance;
    while (bal.length <= dec) bal = '0'+bal;
    bal = bal.slice(0,0-dec)+'.'+bal.slice(0-dec);
    while (bal[bal.length-1] === '0') bal = bal.slice(0,-1);
    if (bal[bal.length-1] === '.') bal = bal.slice(0,-1);
    return bal;
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
          <Route path="/build" element={web3.signer ? <BuildForm onSubmit={handleBuild} inProgress={inProgress}/> : <></>}/>
          <Route path="/dashboard" element={web3.signer ? <DashboardCard web3={web3} updateContract={handleUpdateContract} reset={handleReset}/> : <></>}/>
        </Routes>
      </div>
      <HelpModal showModal={showModal} toggleModal={toggleModal}/>
    </div>
  );
}

export default App;
