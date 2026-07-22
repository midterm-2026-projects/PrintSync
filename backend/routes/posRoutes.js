/**
 * posRoutes.js
 * Route definitions for Point-of-Sale endpoints.
 */

import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createOrder,
  getOrders,
  getOrderById,
  deleteOrderById,
  getTransactions,
} from '../controllers/posController.js';

export const posRouter = Router();

// Product endpoints
posRouter.get('/products', getProducts);             // List/search products
posRouter.get('/products/:id', getProductById);      // Get single product

// Order endpoints
posRouter.post('/orders', createOrder);              // Create new order
posRouter.get('/orders', getOrders);                 // List order history
posRouter.get('/orders/:orderId', getOrderById);     // Get single order with items
posRouter.delete('/orders/:orderId', deleteOrderById); // Delete order (test cleanup)

// Alias for clarity in TransactionHistory component
posRouter.get('/transactions', getTransactions);     // List order history

