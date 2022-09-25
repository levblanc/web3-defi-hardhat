const { ethers } = require('hardhat');

const networkConfig = {
  31337: {
    name: 'hardhat',
    // Ethereum mainnet WETH token, forking mainnet on local hardhat
    wethToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    // Ethereum mainnet deployed contract address:
    // https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts
    poolAddressesProvider: '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
    aggregatorV3InterfaceAddress: '0x773616E4d11A78F511299002da57A0a94577F1f4',
    daiAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  5: {
    name: 'goerli',
    wethToken: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    // Goerli testnet deployed contract address:
    // https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts
    poolAddressesProvider: '0x5E52dEc931FFb32f609681B8438A51c675cc232d',
    // DAI / USD
    aggregatorV3InterfaceAddress: '0x0d79df66BE487753B02D015Fb622DED7f0E9798d',
    daiAddress: '0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844',
  },
};

const developmentChains = ['hardhat', 'localhost'];

module.exports = {
  networkConfig,
  developmentChains,
};
