import { useState } from 'react';

const InventoryTable = ({ items, onAdjustStock, updatingItemId }) => {
  const safeItems = items || [];

  if (safeItems.length === 0) {
    return <p><i>Inventory is currently empty (Initialized State).</i></p>;
  }

  return (
    <table border="1" style={{ width: '100%', textAlign: 'left' }}>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Category</th>
          <th>Stock</th>
          <th>Price</th>
          <th>Adjust Stock</th>
        </tr>
      </thead>
      <tbody>
        {safeItems.map((item) => (
          <tr key={item.id}>
            <td>{item.name ?? item.productName}</td>
            <td>{item.category}</td>
            <td>{item.stock} units</td>
            <td>{'\u20B1'}{Number(item.price || 0).toFixed(2)}</td>
            <td>
              <StockAdjustment
                item={{ ...item, name: item.name ?? item.productName }}
                onAdjustStock={onAdjustStock}
                isUpdating={updatingItemId === item.id}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

function StockAdjustment({ item, onAdjustStock, isUpdating }) {
  const [delta, setDelta] = useState('');

  const submitAdjustment = async () => {
    const numericDelta = Number(delta);
    if (!Number.isInteger(numericDelta) || numericDelta === 0) return;
    await onAdjustStock(item, numericDelta);
    setDelta('');
  };

  return (
    <div>
      <input
        id={`stock-adjustment-${item.id}`}
        aria-label={`Stock adjustment for ${item.name}`}
        type="number"
        step="1"
        value={delta}
        onChange={(event) => setDelta(event.target.value)}
      />
      <button type="button" onClick={submitAdjustment} disabled={isUpdating}>
        {isUpdating ? 'Updating…' : 'Update Stock'}
      </button>
    </div>
  );
}

export default InventoryTable;
