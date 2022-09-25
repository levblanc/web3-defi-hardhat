const { getWeth, AMOUNT } = require('./getWeth');
const { networkConfig } = require('../helper-hardhat-config');
const { network, ethers, getNamedAccounts } = require('hardhat');

// Note: we can actually gain interest by depositing our tokens and our assets to aave
async function main() {
  await getWeth();

  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;
  const { wethToken, daiAddress } = networkConfig[chainId];

  const lendingPool = await getLendingPool(deployer);

  // Approve `lendingPool` to deposit (take away) certain `amount` of weth token
  // on behalf of the `deployer`
  await approveERC20(wethToken, lendingPool.address, AMOUNT, deployer);
  console.log('>>>>>> Depositing...');

  // Deposit weth token into lending pool
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

  // check user account after borrow
  await getBorrowUserData(lendingPool, deployer);

  await repayDai(lendingPool, daiAddress, daiBorrowAmountInWei, deployer);

  // check user account after repay
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

// Anytime you want a contract to interact with your tokens
// You need to approve the contract to do so
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
  // https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool#borrow
  const borrowTx = await lendingPool.borrow(
    daiAddress,
    daiAmountInWei,
    1, // interestRateMode, the type of borrow debt. Stable: 1, Variable: 2
    0, // referral code for Aave referral program. Use 0 for no referral code.
    account // address of user who will incur the debt.
  );

  await borrowTx.wait(1);

  console.log('>>>>>> Borrowed!');
}

async function repayDai(lendingPool, daiAddress, daiAmountInWei, account) {
  // Approve
  await approveERC20(daiAddress, lendingPool.address, daiAmountInWei, account);

  // Repay
  // https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool#repay
  const repayTx = await lendingPool.repay(
    daiAddress,
    daiAmountInWei,
    1, // rateMode, the type of borrow debt. Stable: 1, Variable: 2
    account // address of user who will incur the debt.
  );
  await repayTx.wait(1);

  console.log('>>>>>> Repaid!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
