const express = require('express');
const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');
const cors = require('cors');
const erc20Template = require('./templates/ERC20');
const api = express();
const port = process.env.PORT || 3000;

api.use(cors()) // Use this after the variable declaration

api.use(express.urlencoded({extended: true})); //Parse URL-encoded bodies
api.use(express.json());

api.use(express.static(path.join(__dirname, '/client/build')));
api.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
})

api.post('/api', (req, res) => {
  const folderId = req.body.address;
  const name = req.body.name;
  const contractName = toContractName(name);
  const filename = contractName+'.sol';
  const contractCode = erc20Template.code(contractName, req.body.pausable);
  console.log(contractCode);
  if (!fs.existsSync(`contracts/${folderId}`)) {
    fs.mkdirSync(`contracts/${folderId}`, (err) => {
      console.error(err);
    });
  }
  if (fs.existsSync(`contracts/${folderId}/${filename}`)) {
    fs.unlinkSync(`contracts/${folderId}/${filename}`);
  }
  fs.writeFileSync(`contracts/${folderId}/${filename}`, contractCode, (err) => {
    console.error(err);
  });

  const source = fs.readFileSync(`contracts/${folderId}/${filename}`, 'utf-8');
  
  const compilerInput = {
    language: 'Solidity',
    sources:
    {
      [filename]:
      {
        content: source
      }
    },
    settings:
    {
      optimizer:
      {
        enabled: true
      },
      outputSelection:
      {
        '*':{
          '*':['*']
        }
      }
    }
  };

  let compilation;
  try {
    compilation = solc.compile(JSON.stringify(compilerInput), {import: 
      path => {
        try {
          const source = fs.readFileSync(`templates/${path}`, 'utf-8');
          return { contents: source };
        } catch (err) {
          console.log(err);
          return { error: 'File not found' };
        }
      }
    })
  }
  catch(err) {
    console.log(err);
  }

  const output = JSON.parse(compilation);

  fs.removeSync(`contracts/${folderId}`, (err) =>{ console.error(err)});
  
  const abi = output.contracts[filename][contractName].abi;
  const bytecode = output.contracts[filename][contractName].evm.bytecode.object;

  res.json({
    abi: abi,
    bytecode: bytecode
  });
});

api.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

const toContractName = (name) => {
  // in case the name is all numbers, whitespace and symbols
  if (name.search(/[A-Za-z]/) < 0) return "CustomERC20";

  return (name.slice(0,1).toUpperCase()+name.slice(1))
  .replace(/[^[a-zA-Z][a-z]/g, (e) => { return e.slice(0,1)+e.slice(1).toUpperCase() })
  .replace(/[^a-zA-Z0-9]/g, '');
}