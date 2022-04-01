import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import BuildForm from './Components/BuildForm.jsx';
import Dashboard from './Components/Dashboard.jsx';
import { ethers } from 'ethers';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';

import CustomERC20Builder from './artifacts/src/contracts/CustomERC20Builder.sol/CustomERC20Builder.json';
const contractAddress = '0x96D998E65eBf1BFEdEEDaf59c8D63EC6E06175B9'; //Rinkeby

function App() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [newToken, toggleNewToken] = useState(false);
  const [tokenDashboard, toggleTokenDashboard] = useState(false);
  const [inProgress, toggleInProgress] = useState(false);

  const build = async (name, symbol, supply, decimals) => {
    if (!inProgress) {
      try {
        toggleInProgress(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, CustomERC20Builder.abi, signer);
        const owner = await signer.getAddress();
        const tx = await contract.buildERC20(owner, supply, name, symbol, decimals, {"value": ethers.utils.parseEther("0.001")});
        const rc = await tx.wait();
        const event = rc.events.find(event => event.event === 'TokenDeployment');
        const [own, addr] = event.args;
        const newTokenAddress = addr;
        setTokenAddress(newTokenAddress);
        toggleNewToken(false);
        toggleTokenDashboard(true);
      } catch (e) {
        alert(e);
        toggleInProgress(false);
      }
    }
  }

  return (
    <div className="App">
      <h1>Token Builder</h1>
      <h2>Build your own ERC20 token on the Ethereum (Rinkeby) blockchain!</h2>
      <Card>
        <ButtonGroup>
          <Button variant={!tokenDashboard ? "primary" : "secondary"} onClick={()=>{
            toggleTokenDashboard(false);
            toggleNewToken(true);
          }}>Create A Token</Button>
          <Button variant={tokenDashboard ? "primary" : "secondary"} onClick={()=>{
            toggleNewToken(false);
            toggleTokenDashboard(true);
          }}>Token Dashboard</Button>
        </ButtonGroup>
        {newToken && <BuildForm onSubmit={build} inProgress={inProgress}/>}
        {tokenDashboard && <Dashboard tokenAddress={tokenAddress}/>}
      </Card>
    </div>
  );
}

export default App;
