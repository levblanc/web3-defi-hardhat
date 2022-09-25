const { getWeth, AMOUNT } = require('./getWeth');
const { networkConfig } = require('../helper-hardhat-config');
const { network, ethers, getNamedAccounts } = require('hardhat');

async function main() {
  await getWeth();

  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;
  const { wethToken } = networkConfig[chainId];

  const lendingPool = await getLendingPool(deployer);

  // Approve
  await approveERC20(wethToken, lendingPool.address, AMOUNT, deployer);
  console.log('>>>>>> Depositing...');

  // Deposit
  await lendingPool.deposit(wethToken, AMOUNT, deployer, 0);
  console.log('>>>>>> Deposited!');

  const { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
    lendingPool,
    deployer
  );
}

async function getLendingPool(account) {
  const { chainId } = network.config;
  const { poolAddressesProvider } = networkConfig[chainId];
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    'ILendingPoolAddressesProvider',
    poolAddressesProvider,
    account
  );

  const lendingPoolAddress =
    await lendingPoolAddressesProvider.getLendingPool();

  const lendingPool = await ethers.getContractAt(
    'ILendingPool',
    lendingPoolAddress,
    account
  );

  return lendingPool;
}

async function approveERC20(
  erc20Address,
  spenderAddress,
  amountToSpend,
  account
) {
  const erc20Token = await ethers.getContractAt(
    'IERC20',
    erc20Address,
    account
  );

  const tx = await erc20Token.approve(spenderAddress, amountToSpend);
  await tx.wait(1);
  console.log('>>>>>> ERC20 token approved.');
}

async function getBorrowUserData(lendingPool, account) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(account);

  console.log('>>>>> Worth of ETH deposited:', totalCollateralETH.toString());
  console.log('>>>>> Worth of ETH borrowed:', totalDebtETH.toString());
  console.log(
    '>>>>> Worth of ETH you can borrow:',
    availableBorrowsETH.toString()
  );

  return { availableBorrowsETH, totalDebtETH };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
