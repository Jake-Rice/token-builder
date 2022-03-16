const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC20 Contract", function () {
  let Token, token, addr;
  beforeEach(async function() {
    Token = await ethers.getContractFactory("CustomERC20");
    token = await Token.deploy(
      "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      "100000000",
      "TestCoin",
      "TST",
      "2"
    );
    addr = await ethers.getSigners();
  });

  describe("Deployment", function() {
    it("Should set the correct owner", async function () {
      expect((await token.owner()).toLowerCase()).to.equal("0x70997970c51812dc3a010c7d01b50e0d17dc79c8");
    });
    
    it("Should set the correct initial supply", async function () {
      expect(await token.totalSupply()).to.equal("100000000");
    });

    it("Should set the correct token name", async function () {
      expect(await token.name()).to.equal("TestCoin");
    });

    it("Should set the correct token symbol", async function () {
      expect(await token.symbol()).to.equal("TST");
    });

    it("Should set the correct number of decimal places", async function () {
      expect(await token.decimals()).to.equal(2);
    });
  });

  describe("Transactions", function() {
    it("Should transfer tokens from one account to another", async function() {
      const initialBalance1 = await token.balanceOf(addr[1].address);
      await token.connect(addr[1]).transfer(addr[0].address, 100);
      expect(await token.balanceOf(addr[0].address)).to.equal(100);
      expect(await token.balanceOf(addr[1].address)).to.equal(initialBalance1 - 100);
    });
    it("Should deduct tokens from sender account after transfer", async function() {
      const initialBalance1 = await token.balanceOf(addr[1].address);
      await token.connect(addr[1]).transfer(addr[0].address, 100);
      expect(await token.balanceOf(addr[1].address)).to.equal(initialBalance1.sub(100));
    });
    it("Should revert on attempt to send more than token balance", async function() {
      const initialBalance0 = await token.balanceOf(addr[0].address);
      const initialBalance1 = await token.balanceOf(addr[1].address);
      await expect(token.transfer(addr[1].address, 100)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      expect(await token.balanceOf(addr[0].address)).to.equal(initialBalance0); //balance of addr[0] shouldn't change
      expect(await token.balanceOf(addr[1].address)).to.equal(initialBalance1); //balance of addr[1] shouldn't change
    });
    it("Should approve allowance to another account", async function() {
      const initialBalance0 = await token.balanceOf(addr[0].address);
      const initialBalance1 = await token.balanceOf(addr[1].address);
      await token.connect(addr[1]).approve(addr[0].address, 100);
      expect(await token.allowance(addr[1].address, addr[0].address)).to.equal(100);
      expect(await token.balanceOf(addr[0].address)).to.equal(initialBalance0); //balance of addr[0] shouldn't change
      expect(await token.balanceOf(addr[1].address)).to.equal(initialBalance1); //balance of addr[1] shouldn't change
    });
    it("Should allow account with allowance to withdraw allowed tokens", async function() {
      const initialBalance0 = await token.balanceOf(addr[0].address);
      const initialBalance1 = await token.balanceOf(addr[1].address);
      await token.connect(addr[1]).approve(addr[0].address, 100);
      await token.transferFrom(addr[1].address, addr[0].address, 100);
      expect(await token.balanceOf(addr[0].address)).to.equal(initialBalance0.add(100));
      expect(await token.balanceOf(addr[1].address)).to.equal(initialBalance1.sub(100));
    });
    it("Should allow account with allowance to send allowed tokens to a third account", async function() {
      const initialBalance0 = await token.balanceOf(addr[0].address);
      const initialBalance1 = await token.balanceOf(addr[1].address);
      const initialBalance2 = await token.balanceOf(addr[2].address);
      await token.connect(addr[1]).approve(addr[0].address, 100);
      await token.transferFrom(addr[1].address, addr[2].address, 100);
      expect(await token.balanceOf(addr[0].address)).to.equal(initialBalance0);
      expect(await token.balanceOf(addr[1].address)).to.equal(initialBalance1.sub(100));
      expect(await token.balanceOf(addr[2].address)).to.equal(initialBalance2.add(100));
    });
    it("Should revert if trying to withdraw more than available balance", async function() {
      const initialBalance0 = await token.balanceOf(addr[0].address);
      const initialBalance1 = await token.balanceOf(addr[1].address);
      await token.approve(addr[1].address, 100);
      await expect(token.connect(addr[1]).transferFrom(addr[0].address, addr[1].address, 100)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      expect(await token.balanceOf(addr[0].address)).to.equal(initialBalance0); //balance of addr[0] shouldn't change
      expect(await token.balanceOf(addr[1].address)).to.equal(initialBalance1); //balance of addr[1] shouldn't change
      expect(await token.allowance(addr[0].address, addr[1].address)).to.equal(100); //allowance should still exist
    });
  });

  describe("Minting", function() {
    it("Should mint tokens to the owner account", async function() {
      const initialBalance1 = await token.balanceOf(addr[1].address);
      const initialSupply = await token.totalSupply();
      await token.connect(addr[1]).mint(5000);
      expect(await token.totalSupply()).to.equal(initialSupply.add(5000));
      expect(await token.balanceOf(addr[1].address)).to.equal(initialBalance1.add(5000));
    });
    it("Should mint tokens to a non-owner account", async function() {
      const initialBalance0 = await token.balanceOf(addr[0].address);
      const initialBalance1 = await token.balanceOf(addr[1].address);
      const initialSupply = await token.totalSupply();
      await token.connect(addr[1]).mintTo(addr[0].address, 5000);
      expect(await token.totalSupply()).to.equal(initialSupply.add(5000));
      expect(await token.balanceOf(addr[0].address)).to.equal(initialBalance0.add(5000));
      expect(await token.balanceOf(addr[1].address)).to.equal(initialBalance1);
    });
    it("Should revert if not called by owner", async function() {
      await expect(token.mint(5000)).to.be.revertedWith("Unauthorized: Not the owner account");
      await expect(token.mintTo(addr[0].address, 5000)).to.be.revertedWith("Unauthorized: Not the owner account");
    });
    it("Should revert if minting to the zero address", async function() {
      await expect(token.connect(addr[1]).mintTo(ethers.constants.AddressZero, 5000)).to.be.revertedWith("ERC20: mint to the zero address");
    });
  });
  describe("Burning", function() {
    it("Should allow token holder to burn tokens", async function() {
      const initialBalance1 = await token.balanceOf(addr[1].address);
      await token.connect(addr[1]).burn(5000);
      expect(await token.balanceOf(addr[1].address)).to.equal(initialBalance1.sub(5000));
    });
    it("Should revert if burning more than available balance", async function() {
      const initialBalance1 = await token.balanceOf(addr[1].address);
      await expect(token.connect(addr[1]).burn(initialBalance1.add(1))).to.be.revertedWith("ERC20: burn amount exceeds balance");
      expect(await token.balanceOf(addr[1].address)).to.equal(initialBalance1);
    });
  });
});
