const { getWeth } = require('./getWeth');
const { networkConfig } = require('../helper-hardhat-config');
const { network, ethers, getNamedAccounts } = require('hardhat');

async function main() {
  await getWeth();
  const { deployer } = await getNamedAccounts();
  const lendingPool = await getLendingPool(deployer);
  console.log('>>>>>> lending pool address:', lendingPool);
}

async function getLendingPool(account) {
  const { chainId } = network.config;
  const { poolAddressProvider } = networkConfig[chainId];
  const lendingPoolAddressProvider = await ethers.getContractAt(
    'ILendingPoolAddressesProvider',
    poolAddressProvider,
    account
  );

  console.log(
    '>>>>>> lendingPoolAddressProvider.getLendingPool',
    lendingPoolAddressProvider.getLendingPool
  );

  const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();
  console.log('>>>>>> lendingPoolAddress', lendingPoolAddress);

  // const lendingPool = await ethers.getContractAt(
  //   'ILendingPool',
  //   lendingPoolAddress,
  //   account
  // );

  // return lendingPool;
  return 'fake result str';
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
