import express from 'express';
import { forgetPassword, login, logoutUser, register, resetPassword,UserProfile,getUserProfileById,updateUserProfile,getAllUserProfiles,} from '../Controller/authcontroller.js';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';

import upload from '../Middleware/multer.js'; // Import multer middleware
const router = express.Router();

router.post('/register', register);
router.post('/login',authenticate,login)
router.post('/forget-password', forgetPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/logout', logoutUser);
router.get('/profile',UserProfile);
router.get('/users/:id', authenticate, getUserProfileById);
router.put('/profile/update/:id', upload.single('profilePicture'),updateUserProfile)
router.get('/all',authenticate,authorize('admin'), getAllUserProfiles);


export default router;
