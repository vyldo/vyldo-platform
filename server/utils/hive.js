import { Client, PrivateKey } from '@hiveio/dhive';

const client = new Client([
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://api.openhive.network',
]);

export const verifyHiveAccount = async (username) => {
  try {
    const accounts = await client.database.getAccounts([username]);
    return accounts && accounts.length > 0;
  } catch (error) {
    console.error('Error verifying Hive account:', error);
    return false;
  }
};

export const getHiveAccountInfo = async (username) => {
  try {
    const accounts = await client.database.getAccounts([username]);
    if (accounts && accounts.length > 0) {
      return accounts[0];
    }
    return null;
  } catch (error) {
    console.error('Error getting Hive account info:', error);
    return null;
  }
};

export const sendHivePayment = async (fromAccount, toAccount, amount, memo, privateKey) => {
  try {
    const key = PrivateKey.fromString(privateKey);
    
    const transfer = {
      from: fromAccount,
      to: toAccount,
      amount: `${amount.toFixed(3)} HIVE`,
      memo: memo || '',
    };

    const result = await client.broadcast.transfer(transfer, key);
    
    return {
      success: true,
      txId: result.id,
      blockNum: result.block_num,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error sending Hive payment:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getHiveTransactionHistory = async (account, limit = 100) => {
  try {
    const history = await client.database.getAccountHistory(account, -1, limit);
    return history.filter(item => {
      const op = item[1].op;
      return op[0] === 'transfer';
    });
  } catch (error) {
    console.error('Error getting Hive transaction history:', error);
    return [];
  }
};

export const verifyHiveTransaction = async (txId) => {
  try {
    const transaction = await client.database.getTransaction(txId);
    return transaction !== null;
  } catch (error) {
    console.error('Error verifying Hive transaction:', error);
    return false;
  }
};

export const getHivePrice = async () => {
  try {
    const ticker = await client.database.getTicker();
    return parseFloat(ticker.latest);
  } catch (error) {
    console.error('Error getting Hive price:', error);
    return 0;
  }
};
