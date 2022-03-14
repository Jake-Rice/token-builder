import logo from './logo.svg';
import './App.css';
import BuildForm from './Components/BuildForm.jsx';
import ConnectButton from './Components/ConnectButton.jsx'
import { useState } from 'react';

function App() {
  const [web3Connected, setWeb3Connected] = useState(false);
  return (
    <div className="App">
      <h1>Token Builder</h1>
      <h2>Build your own ERC20 token on the Ethereum blockchain!</h2>
      {web3Connected ? <BuildForm/> : <ConnectButton onConnect={setWeb3Connected}/>}
    </div>
  );
}

export default App;
