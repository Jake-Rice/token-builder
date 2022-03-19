import logo from './logo.svg';
import './App.css';
import BuildForm from './Components/BuildForm.jsx';
import { ethers } from 'ethers';

import CustomERC20Builder from './artifacts/src/contracts/CustomERC20Builder.sol/CustomERC20Builder.json';
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function App() {
  const build = async (name, symbol, supply, decimals, mintable) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, CustomERC20Builder.abi, signer);
    const owner = await signer.getAddress();
    console.log(owner, supply, name, symbol, decimals, mintable);
    await contract.buildERC20(owner, supply, name, symbol, decimals, mintable);
  }

  return (
    <div className="App">
      <h1>Token Builder</h1>
      <h2>Build your own ERC20 token on the Ethereum blockchain!</h2>
      <BuildForm onSubmit={build}/>
    </div>
  );
}

export default App;
