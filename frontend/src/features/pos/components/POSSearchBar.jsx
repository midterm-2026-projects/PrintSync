import React from 'react';

const POSSearchBar = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="pos-search">Search Inventory:</label>
      <input 
        id="pos-search"
        type="text" 
        placeholder="Search by name..." 
        value={value || ""} // Ensures no uncontrolled input error if null
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default POSSearchBar;