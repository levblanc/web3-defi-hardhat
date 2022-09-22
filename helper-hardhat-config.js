const { ethers } = require('hardhat');

const networkConfig = {
  31337: {
    name: 'hardhat',
    // mainnet WETH token, forking mainnet on local hardhat
    wethToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    // Polygon mainnet deployed contract address:
    // https://docs.aave.com/developers/deployed-contracts/v3-mainnet/polygon
    poolAddressProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
  },
  4: {
    name: 'rinkeby',
    wethToken: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    // Rinkeby testnet deployed contract address:
    // https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
    poolAddressProvider: '0xBA6378f1c1D046e9EB0F538560BA7558546edF3C',
  },
  // https://docs.chain.link/docs/vrf/v2/supported-networks/#goerli-testnet
  5: {
    name: 'goerli',
    wethToken: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    // Goerli testnet deployed contract address:
    // https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
    poolAddressProvider: '0xc4dCB5126a3AfEd129BC3668Ea19285A9f56D15D',
  },
};

const developmentChains = ['hardhat', 'localhost'];

module.exports = {
  networkConfig,
  developmentChains,
};
