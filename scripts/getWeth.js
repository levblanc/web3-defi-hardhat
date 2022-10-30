const { getNamedAccounts, ethers, network } = require('hardhat');
const { networkConfig } = require('../helper-hardhat-config');

const AMOUNT = ethers.utils.parseEther('0.02');

// WETH is a way to tokenize the Ethereum / layer 1 blockchain native token
// https://weth.io/
async function getWeth() {
  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;
  const { wethTokenAddress } = networkConfig[chainId];

  // Log to check balance diff before & after deposit
  const startBalance = await ethers.provider.getBalance(deployer);
  console.log('>>>>>> Account balance at start:', startBalance.toString());

  const iWeth = await ethers.getContractAt('IWeth', wethTokenAddress, deployer);

  console.log('>>>>>> Depositing WETH...');

  const tx = await iWeth.deposit({ value: AMOUNT });
  await tx.wait(1);

  const wethBalance = await iWeth.balanceOf(deployer);
  console.log('>>>>>> WETH deposited! WETH Balance:', wethBalance.toString());

  // Log to check balance diff before & after deposit
  const endBalance = await ethers.provider.getBalance(deployer);
  console.log(
    '>>>>>> Account balance after WETH deposit:',
    endBalance.toString()
  );
}

module.exports = { getWeth, AMOUNT };
