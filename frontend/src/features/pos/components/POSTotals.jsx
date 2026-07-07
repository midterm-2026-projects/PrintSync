import React, { useState } from 'react';
import { calculateFinancials, formatCurrency } from '../services/posService';

const POSTotals = ({ cartItems = [] }) => {
  const [taxRate, setTaxRate] = useState(12);

  // Use the service for calculations
  const { subtotal, tax, total, safeTaxRate } = calculateFinancials(cartItems, taxRate);

  return (
    <div id="pos-totals-display" style={{ border: '2px solid black', padding: '15px', marginTop: '20px', width: '320px' }}>
      <h4>Order Summary</h4>
      
      <p>Subtotal: <span data-testid="subtotal-val">{formatCurrency(subtotal)}</span></p>
      
      <div>
        <label htmlFor="tax-input">Tax Percentage (%): </label>
        <input 
          id="tax-input"
          type="number" 
          value={taxRate} 
          onChange={(e) => setTaxRate(Number(e.target.value))}
          style={{ width: '50px' }}
        />
      </div>

      <p>Applied Tax ({safeTaxRate}%): <span data-testid="tax-val">{formatCurrency(tax)}</span></p>
      
      <hr />
      
      <h3>Total: <span data-testid="total-val" style={{ color: 'green' }}>{formatCurrency(total)}</span></h3>
    </div>
  );
};

export default POSTotals;