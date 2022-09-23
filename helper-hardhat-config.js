const { ethers } = require('hardhat');

const networkConfig = {
  31337: {
    name: 'hardhat',
    // mainnet WETH token, forking mainnet on local hardhat
    wethToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    // Mainnet deployed contract address:
    // https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts
    poolAddressProvider: '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
  },
  5: {
    name: 'goerli',
    wethToken: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    // Goerli testnet deployed contract address:
    // https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts
    poolAddressProvider: '0x5E52dEc931FFb32f609681B8438A51c675cc232d',
  },
};

const developmentChains = ['hardhat', 'localhost'];

module.exports = {
  networkConfig,
  developmentChains,
};
