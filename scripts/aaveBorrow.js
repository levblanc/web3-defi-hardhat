const { getWeth, AMOUNT } = require('./getWeth');
const { networkConfig } = require('../helper-hardhat-config');
const { network, ethers, getNamedAccounts } = require('hardhat');

async function main() {
  await getWeth();

  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;
  const { wethToken, daiAddress } = networkConfig[chainId];

  const lendingPool = await getLendingPool(deployer);

  // Approve
  await approveERC20(wethToken, lendingPool.address, AMOUNT, deployer);
  console.log('>>>>>> Depositing...');

  // Deposit
  await lendingPool.deposit(wethToken, AMOUNT, deployer, 0);
  console.log('>>>>>> Deposited!');

  const daiPrice = await getDaiPrice();
  const { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
    lendingPool,
    deployer
  );

  // Borrow 95% of avaiale ETH, not using 100% of our collaterals, to be safe.
  const ethBorrowAmount = availableBorrowsETH.toString() * 0.95;
  console.log('>>>>>> ethBorrowAmount', ethBorrowAmount);

  const daiBorrowAmount = ethBorrowAmount / daiPrice;
  console.log('>>>>>> daiBorrowAmount', daiBorrowAmount);

  const daiBorrowAmountInWei = ethers.utils.parseEther(
    daiBorrowAmount.toString()
  );
  console.log('>>>>>> daiBorrowAmountInWei', daiBorrowAmountInWei);

  await borrowDai(lendingPool, daiAddress, daiBorrowAmountInWei, deployer);

  // check user account after borrowing
  await getBorrowUserData(lendingPool, deployer);
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

  console.log('>>>>>> Worth of ETH deposited:', totalCollateralETH.toString());
  console.log('>>>>>> Worth of ETH borrowed:', totalDebtETH.toString());
  console.log(
    '>>>>>> Worth of ETH you can borrow:',
    availableBorrowsETH.toString()
  );

  return { availableBorrowsETH, totalDebtETH };
}

// Get DAI price with Chainlink price feed
async function getDaiPrice() {
  const { chainId } = network.config;
  const { aggregatorV3InterfaceAddress } = networkConfig[chainId];

  // No transaction needed, so no need to pass account as third param
  const daiEthPrice = await ethers.getContractAt(
    'AggregatorV3Interface',
    aggregatorV3InterfaceAddress
  );

  const priceData = await daiEthPrice.latestRoundData();
  // console.log('>>>>>> priceData:', priceData);

  const price = priceData[1].toString();
  console.log('>>>>>> DAI/ETH price:', price);

  return price;
}

async function borrowDai(lendingPool, daiAddress, daiAmountInWei, account) {
  const borrowTx = await lendingPool.borrow(
    daiAddress,
    daiAmountInWei,
    1,
    0,
    account
  );

  await borrowTx.wait(1);

  console.log('>>>>>> Borrowed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
