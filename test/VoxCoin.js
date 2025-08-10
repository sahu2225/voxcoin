const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VoxCoin", function () {
  let VoxCoin, voxCoin, owner, addr1, addr2, taxWallet;

  beforeEach(async function () {
    [owner, addr1, addr2, taxWallet] = await ethers.getSigners();
    VoxCoin = await ethers.getContractFactory("VoxCoin");
    voxCoin = await VoxCoin.deploy(taxWallet.address);
  });

  it("should have correct name and symbol", async function () {
    expect(await voxCoin.name()).to.equal("VoxCoin");
    expect(await voxCoin.symbol()).to.equal("VXC");
  });

  it("should mint initial supply to owner", async function () {
    const supply = await voxCoin.totalSupply();
    expect(await voxCoin.balanceOf(owner.address)).to.equal(supply);
  });

  it("should transfer tokens with tax", async function () {
    const amount = ethers.parseEther("1000");
    const taxBps = await voxCoin.taxBps();

    await voxCoin.transfer(addr1.address, amount);

    const tax = (amount * taxBps) / 10000n;
    expect(await voxCoin.balanceOf(addr1.address)).to.equal(amount - tax);
    expect(await voxCoin.balanceOf(taxWallet.address)).to.equal(tax);
  });

  it("should allow burning tokens", async function () {
    const amount = ethers.parseEther("100");
    const supplyBefore = await voxCoin.totalSupply();

    await voxCoin.burn(amount);

    expect(await voxCoin.totalSupply()).to.equal(supplyBefore - amount);
  });

  it("should update tax wallet", async function () {
    await voxCoin.setTaxWallet(addr2.address);
    expect(await voxCoin.taxWallet()).to.equal(addr2.address);
  });

  it("should update tax bps", async function () {
    await voxCoin.setTaxBps(500);
    expect(await voxCoin.taxBps()).to.equal(500);
  });

it("should not allow tax bps above max", async function () {
  await expect(voxCoin.setTaxBps(3000)).to.be.revertedWith("Max 25% tax");
});

  it("should not allow setting tax wallet to zero address", async function () {
    await expect(voxCoin.setTaxWallet(ethers.ZeroAddress))
      .to.be.revertedWith("Invalid address");
  });

  it("should not allow transfer from zero address", async function () {
    // Not directly testable as zero address can't send transactions
  });
});
