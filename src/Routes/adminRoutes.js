import express from 'express';
import { adminDashboard,getAllUserProgress, getUserProgress} from '../Controller/adminController.js';
import { authenticate,authorize} from '../Middleware/authMiddleware.js';
import { sendPersonalizedRecommendations } from '../Controller/recommendationController.js';

const router = express.Router();

router.get('/dashboard', authenticate, authorize('admin'), adminDashboard);
router.get('/progress/all', authenticate, authorize('admin'), getAllUserProgress);
// Route to get progress for a specific user
router.get('/progress/:userId', authenticate, authorize('admin'), getUserProgress);
router.post('/send',sendPersonalizedRecommendations)
export default router;
