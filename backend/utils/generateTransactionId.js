/**
 * Helper function to generate a unique transaction ID.
 * Format: TXN-YYYYMMDD-XXXXXX
 */
const generateTransactionId = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN-${date}-${random}`;
};

export default generateTransactionId;