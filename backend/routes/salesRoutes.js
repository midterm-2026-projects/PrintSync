import { Router } from 'express';

import { transaction, getTransactions } from '../controllers/salesController.js';

export const salesRouter = Router();

// Week 4 Day 1 POS flows
salesRouter.post('/transactions', transaction);
salesRouter.post('/finalize', transaction);
salesRouter.get('/transactions', getTransactions);

