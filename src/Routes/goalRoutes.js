import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  setGoal,
  getGoals,
  updateGoal,
  deleteGoal,getGoalById
} from '../Controller/goalController.js';

const router = express.Router();
router.post('/', authenticate, setGoal);
router.get('/', authenticate, getGoals);
router.put('/:id', authenticate, updateGoal);
router.delete('/:id', authenticate, deleteGoal);
router.get('/goals/:id', authenticate, getGoalById);

export default router;
