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
const contractAddress = '0x68D141E76b8CFE92A2752e0cD6BF143d48f5Ab69'; //Rinkeby

function App() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [newToken, toggleNewToken] = useState(false);
  const [tokenDashboard, toggleTokenDashboard] = useState(false);

  const build = async (name, symbol, supply, decimals) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, CustomERC20Builder.abi, signer);
    const owner = await signer.getAddress();
    console.log(contract);
    const eventFilter = contract.filters.TokenDeployment(owner, null);
    contract.on(eventFilter, (ownerAddress, tokenAddr, event) => {
      setTokenAddress(tokenAddr);
    })
    await contract.buildERC20(owner, supply, name, symbol, decimals, {"value": ethers.utils.parseEther("0.001")});
  }

  return (
    <div className="App">
      <h1>Token Builder</h1>
      <h2>Build your own ERC20 token on the Ethereum blockchain!</h2>
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
        {newToken && <BuildForm onSubmit={build}/>}
        {tokenDashboard && <Dashboard tokenAddress={tokenAddress}/>}
      </Card>
    </div>
  );
}

export default App;
