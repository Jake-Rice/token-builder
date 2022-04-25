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

api.use(express.static(path.join(__dirname, 'client/build')));
api.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
})

api.post('/api', (req, res) => {
  const folderId = req.body.address;
  const name = req.body.name;
  const contractName = parseFileName(name);
  const filename = contractName+'.sol';
  fs.mkdirSync(`contracts/${folderId}`, (err) => {
    console.error(err);
  });
  fs.writeFileSync(`contracts/${folderId}/${filename}`, erc20Template.code(contractName), (err) => {
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
          return { contents: fs.readFileSync(`node_modules/${path}`, 'utf-8') };``
        } catch (err) {
          return { error: 'File not found' };
        }
      }
    })
  }
  catch(err) {
    console.error(err);
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

const parseFileName = (name) => {
  // in case the name is all numbers, whitespace and symbols
  if (name.search(/[A-Za-z]/) < 0) return "CustomERC20";
  let arr = name.split('');
  // start with the first letter
  while (/[^A-Za-z]/.test(arr[0])) arr.shift();
  for (let i=0; i<arr.length; i++) { //title case
    if (i===0 || /[^A-Za-z0-9]/.test(arr[i-1])) arr[i] = arr[i].toUpperCase();
  }
  // remove symbols and whitespace
  let output =  arr.filter((char) => {
    return /[A-Za-z0-9]/.test(char);
  }).join('');
  return output;
}