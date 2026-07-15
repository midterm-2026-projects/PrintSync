import { Router } from 'express';

import {
  createTransaction,
  finalizeTransaction,
  getTransactions,
} from '../controllers/salesController.js';

export const salesRouter = Router();

// Week 4 Day 1 POS flows
salesRouter.post('/transactions', createTransaction);
salesRouter.post('/finalize', finalizeTransaction);
salesRouter.get('/transactions', getTransactions);

