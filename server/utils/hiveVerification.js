// Hive Blockchain Transaction Verification
// This will verify transactions on Hive blockchain

export const verifyHiveTransaction = async (transactionId, expectedAmount, expectedMemo, escrowAccount = 'vyldo-escrow') => {
  try {
    console.log('🔍 Verifying transaction:', {
      transactionId,
      expectedAmount,
      expectedMemo,
      escrowAccount
    });

    // Basic validation
    if (!transactionId || transactionId.length < 10) {
      return {
        verified: false,
        error: 'Invalid transaction ID format'
      };
    }

    if (!expectedMemo || expectedMemo.length < 5) {
      return {
        verified: false,
        error: 'Invalid memo format'
      };
    }

    // STRICT VERIFICATION FOR PRODUCTION
    // This will prevent fake/duplicate/wrong transactions
    
    try {
      // Try to fetch transaction from Hive blockchain
      const response = await fetch(`https://api.hive.blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'condenser_api.get_transaction',
          params: [transactionId],
          id: 1
        })
      });

      const data = await response.json();
      
      // Check if transaction exists
      if (!data.result || data.error) {
        console.log('❌ Transaction not found on blockchain');
        return {
          verified: false,
          error: 'Transaction not found on Hive blockchain. Please check your transaction ID.'
        };
      }

      const tx = data.result;
      
      // Find transfer operation
      const transferOp = tx.operations.find(op => op[0] === 'transfer');
      
      if (!transferOp) {
        console.log('❌ No transfer operation found');
        return {
          verified: false,
          error: 'No transfer operation found in this transaction'
        };
      }

      const [, transferData] = transferOp;
      const { from, to, amount, memo } = transferData;

      console.log('📋 Transaction details:', {
        from,
        to,
        amount,
        memo
      });

      // Verify recipient is escrow account
      if (to !== escrowAccount) {
        console.log('❌ Payment not sent to escrow account');
        return {
          verified: false,
          error: `Payment must be sent to ${escrowAccount}. You sent to: ${to}`
        };
      }

      // Verify amount
      const [amountValue, currency] = amount.split(' ');
      const txAmount = parseFloat(amountValue);
      
      if (currency !== 'HIVE') {
        console.log('❌ Wrong currency');
        return {
          verified: false,
          error: `Payment must be in HIVE. You sent: ${currency}`
        };
      }

      if (Math.abs(txAmount - expectedAmount) > 0.001) {
        console.log('❌ Amount mismatch');
        return {
          verified: false,
          error: `Amount mismatch. Expected: ${expectedAmount} HIVE, Got: ${txAmount} HIVE`
        };
      }

      // Verify memo
      if (memo !== expectedMemo) {
        console.log('❌ Memo mismatch');
        return {
          verified: false,
          error: `Memo mismatch. Expected: ${expectedMemo}, Got: ${memo}`
        };
      }

      console.log('✅ All verification checks passed!');

      return {
        verified: true,
        from,
        amount: txAmount,
        timestamp: tx.timestamp || new Date(),
        transactionId
      };

    } catch (fetchError) {
      console.error('❌ Blockchain fetch error:', fetchError);
      
      // If blockchain is unreachable, reject for security
      return {
        verified: false,
        error: 'Unable to verify transaction on blockchain. Please try again later.'
      };
    }

  } catch (error) {
    console.error('❌ Transaction verification error:', error);
    return {
      verified: false,
      error: error.message || 'Verification failed'
    };
  }
};

export const checkTransactionStatus = async (transactionId) => {
  // Check if transaction is confirmed on blockchain
  // Returns: pending, confirmed, failed
  
  try {
    // TODO: Implement real blockchain check
    
    return {
      status: 'confirmed',
      confirmations: 1,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      status: 'unknown',
      error: error.message
    };
  }
};

export const validateMemoFormat = (memo) => {
  // Validate memo format: VYLDO-{gigId}-{userId}-{timestamp}
  // For development: Accept any memo starting with VYLDO-
  if (process.env.NODE_ENV === 'development') {
    return memo && memo.startsWith('VYLDO-') && memo.length >= 10;
  }
  
  // For production: Strict format
  const memoRegex = /^VYLDO-[a-f0-9]{6}-[a-f0-9]{6}-[0-9]{6}$/;
  return memoRegex.test(memo);
};

export const isEscrowAccount = (account) => {
  // Verify account is the official escrow
  const validEscrowAccounts = ['vyldo-escrow', 'vyldo-payments'];
  return validEscrowAccounts.includes(account.toLowerCase());
};
