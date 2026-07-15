/**
 * inventoryRoutes.js
 * Route definitions for inventory management endpoints.
 */

import { Router } from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  adjustStock,
  getStockHistory,
  getDesigns,
  createDesign,
  deleteDesign,
} from '../controllers/inventoryController.js';

export const inventoryRouter = Router();

// Inventory items endpoints
inventoryRouter.get('/items', getItems);                        // List/search items
inventoryRouter.post('/items', createItem);                    // Create item
inventoryRouter.get('/items/:id', getItemById);                // Get single item
inventoryRouter.put('/items/:id', updateItem);                 // Update item
inventoryRouter.delete('/items/:id', deleteItem);              // Delete item

// Design/gallery endpoints
inventoryRouter.get('/designs', getDesigns);                   // List designs
inventoryRouter.post('/designs', createDesign);                // Create design
inventoryRouter.delete('/designs/:id', deleteDesign);          // Delete design
