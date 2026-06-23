export const calculateTotalRevenue = (transactions) => {
  // If transactions is null, undefined, or empty, return 0
  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return 0;
  }

  return transactions.reduce((acc, curr) => {
    // If amount is missing or invalid, treat as 0
    const val = (curr && curr.amount) ? Number(curr.amount) : 0;
    return acc + val;
  }, 0);
};

export const formatCurrency = (amount) => {
  // Handle case where amount is empty or not a number
  const safeAmount = (amount === null || amount === undefined || isNaN(amount)) ? 0 : amount;
  
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(safeAmount).replace('PHP', '₱').trim();
};