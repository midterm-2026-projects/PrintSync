/**
 * POS Service - Calculation Engine Logic
 */

export const calculateFinancials = (cartItems, taxRate) => {
  // 1. Calculate Subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.price || 0;
    return acc + (price * item.quantity);
  }, 0);

  // 2. Logic: Ensure taxRate is never treated as a negative number
  const safeTaxRate = taxRate < 0 ? 0 : taxRate;
  
  // 3. Calculate Tax and Total
  const tax = subtotal * (safeTaxRate / 100);
  const total = subtotal + tax;

  return { 
    subtotal, 
    tax, 
    total, 
    safeTaxRate 
  };
};

// Formatting helper
export const formatCurrency = (val) => 
  `₱${val.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;