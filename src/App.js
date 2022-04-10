import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import BuildForm from './Components/BuildForm.jsx';
import DashboardCard from './Components/DashboardCard'
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import abi from './Components/abi';

import CustomERC20Builder from './artifacts/src/contracts/CustomERC20Builder.sol/CustomERC20Builder.json';
const contractAddress = '0x96D998E65eBf1BFEdEEDaf59c8D63EC6E06175B9'; //Rinkeby

function App() {
  const [web3, setWeb3] = useState({
  });

  const [tokenAddress, setTokenAddress] = useState('');
  const [inProgress, toggleInProgress] = useState(false);

  useEffect(async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, CustomERC20Builder.abi, signer);
    setWeb3({
      provider: provider,
      signer: signer,
      contract: contract
    });
  }, []);

  const build = async (name, symbol, supply, decimals) => {
    if (!inProgress) {
      try {
        const contract = new ethers.Contract(contractAddress, CustomERC20Builder.abi, web3.signer);
        const owner = await web3.signer.getAddress();
        const tx = await contract.buildERC20(owner, supply, name, symbol, decimals, {"value": ethers.utils.parseEther("0.001")});
        toggleInProgress(true);
        const rc = await tx.wait();
        const event = rc.events.find(event => event.event === 'TokenDeployment');
        const [own, addr] = event.args;
        const newContract = new ethers.Contract(addr, abi, web3.signer);
        setWeb3({...web3, contract: newContract});
        setTokenAddress(addr);
        toggleInProgress(false);
        navigate("/token-builder/dashboard");
      } catch (e) {
        alert("Error: token not created\n"+ e.message);
        toggleInProgress(false);
      }
    }
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
      <Link to="/token-builder/build"><Button variant="primary">Create A Token</Button></Link>
      <Link to="/token-builder/dashboard"><Button variant="secondary">Token Dashboard</Button></Link>
      <Routes>
        <Route path="/" element={<></>}/>
        <Route path="/token-builder/" element={<></>}/>
        <Route path="/token-builder/build" element={<BuildForm onSubmit={build} inProgress={inProgress}/>}/>
        <Route path="/token-builder/dashboard" element={web3.signer ? <DashboardCard web3={web3} tokenAddress={tokenAddress} setTokenAddress={setTokenAddress} updateContract={handleUpdateContract} reset={handleReset}/> : <></>}/>
      </Routes>
    </div>
  );
}

export default App;
