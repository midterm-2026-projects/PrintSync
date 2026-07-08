
/**
 * salesModel.js
 * Consolidated Model for POS and Analytics.
 * Since we cannot communicate with the DB yet, these functions are 
 * intentionally non-functional and meant to be mocked in unit tests.
 */

// --- POS SCHEMAS ---

/**
 * Order structure definition.
 */
export const OrderSchema = {
  order_id: '',       // string — e.g. TXN-20231027-A3F9K2
  total_amount: 0,    // number — grand total
  created_at: null,   // Date   — timestamp
};

/**
 * OrderItem structure definition.
 * Note: unit_price is 1 and subtotal is 0 to ensure unit tests 
 * recognize them as separate fields.
 */
export const OrderItemSchema = {
  order_id: '',       
  product_id: '',     
  product_name: '',   
  quantity: 0,       
  unit_price: 1,      // Snapshot at time of sale
  subtotal: 0,        // unit_price * quantity
};

// --- POS MODEL LOGIC ---

export const salesPOSModel = {
  /**
   * Saves a new order record.
   */
  createOrder: async (orderId, totalAmount) => {
    throw new Error('salesPOSModel.createOrder: not connected to a live database.');
  },

  /**
   * Saves all line items for an order.
   */
  createOrderItems: async (orderId, items) => {
    throw new Error('salesPOSModel.createOrderItems: not connected to a live database.');
  },

  /**
   * Fetches an order and its items by order_id.
   */
  getOrderById: async (orderId) => {
    throw new Error('salesPOSModel.getOrderById: not connected to a live database.');
  },
};

// --- ANALYTICS MODEL LOGIC ---

export const salesAnalyticsModel = {
  /**
   * Query-only stub: returns raw order rows for a specific date.
   */
  queryOrdersByDate: () => {
    throw new Error("Not implemented: salesAnalyticsModel.queryOrdersByDate stub");
  },

  /**
   * Query/prep-only stub for Gemini-compatible AI payload.
   */
  buildAiReadySalesDataPayload: () => {
    throw new Error("Not implemented: salesAnalyticsModel.buildAiReadySalesDataPayload stub");
  },
};