import React, { useState } from 'react';

const POSTotals = ({ cartItems = [] }) => {
  // Logic: Editable Tax Rate (Default 12%)
  const [taxRate, setTaxRate] = useState(12);

  // Absorbed Logic: Calculation Engine
  const calculateFinancials = () => {
    const subtotal = cartItems.reduce((acc, item) => {
      const price = item.price || 0;
      return acc + (price * item.quantity);
    }, 0);

    // Logic Fix: Ensure taxRate is never treated as a negative number in calculations
    const safeTaxRate = taxRate < 0 ? 0 : taxRate;
    
    const tax = subtotal * (safeTaxRate / 100);
    const total = subtotal + tax;

    return { subtotal, tax, total, safeTaxRate };
  };

  const { subtotal, tax, total, safeTaxRate } = calculateFinancials();

  const format = (val) => `₱${val.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;

  return (
    <div id="pos-totals-display" style={{ border: '2px solid black', padding: '15px', marginTop: '20px', width: '320px' }}>
      <h4>Order Summary</h4>
      
      <p>Subtotal: <span data-testid="subtotal-val">{format(subtotal)}</span></p>
      
      {/* Editable Tax Input */}
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="tax-input">Tax Percentage (%): </label>
        <input 
          id="tax-input"
          type="number" 
          value={taxRate} 
          onChange={(e) => setTaxRate(Number(e.target.value))}
          style={{ width: '50px' }}
        />
      </div>

      <p>Applied Tax ({safeTaxRate}%): <span data-testid="tax-val">{format(tax)}</span></p>
      
      <hr />
      
      <h3>Total: <span data-testid="total-val" style={{ color: 'green' }}>{format(total)}</span></h3>
    </div>
  );
};

export default POSTotals;