export const calculatePlatformFee = (amount) => {
  let feePercentage;

  if (amount >= 1 && amount < 2000) {
    feePercentage = 0.09;
  } else if (amount >= 2000 && amount < 5000) {
    feePercentage = 0.08;
  } else if (amount >= 5000 && amount < 9000) {
    feePercentage = 0.07;
  } else if (amount >= 9000) {
    feePercentage = 0.06;
  } else {
    feePercentage = 0.09;
  }

  const fee = amount * feePercentage;
  const sellerEarnings = amount - fee;

  return {
    totalAmount: amount,
    feePercentage: feePercentage * 100,
    platformFee: parseFloat(fee.toFixed(3)),
    sellerEarnings: parseFloat(sellerEarnings.toFixed(3)),
  };
};

export const getFeePercentage = (amount) => {
  if (amount >= 1 && amount < 2000) {
    return 9;
  } else if (amount >= 2000 && amount < 5000) {
    return 8;
  } else if (amount >= 5000 && amount < 9000) {
    return 7;
  } else if (amount >= 9000) {
    return 6;
  }
  return 9;
};

export const calculateNetEarnings = (grossAmount) => {
  const feeData = calculatePlatformFee(grossAmount);
  return feeData.sellerEarnings;
};

export const formatHiveAmount = (amount) => {
  return `${parseFloat(amount).toFixed(3)} HIVE`;
};

export const parseHiveAmount = (amountString) => {
  return parseFloat(amountString.replace(' HIVE', ''));
};
