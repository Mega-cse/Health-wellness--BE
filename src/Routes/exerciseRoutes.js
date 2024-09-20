import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js'; // Import authentication and authorization middleware
import upload from '../Middleware/multer.js'; // Import multer middleware
import { 
  logExercise, 
  getExercises, 
  updateExercise, 
  deleteExercise,trackExercise,getAllUserProgress
} from '../Controller/ExerciseController.js'; // Import exercise controller functions

const router = express.Router();

// Route for logging (posting) new exercises (admin only)
router.post('/log', authenticate, authorize('admin'), upload.single('image'), logExercise);
router.get('/get', authenticate,getExercises);
router.post('/track-exercise', authenticate,trackExercise);
router.get('/progress', authenticate,  authenticate, authorize('admin'),getAllUserProgress);

// Route for updating exercises (admin only)
router.put('/update/:id', authenticate, authorize('admin'), upload.single('image'), updateExercise);

// Route for deleting exercises (admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteExercise);

export default router;
