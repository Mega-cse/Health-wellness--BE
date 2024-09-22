import User from '../Models/authModel.js';
import cloudinary from '../config/cloudinaryConfig.js';
import { validationResult } from 'express-validator';  // For validation
import models from '../Models/exerciseModel.js';
const { Exercise, Tracking } = models;
import { sendEmail } from '../Services/emailService.js';

import { validationResult } from 'express-validator';
import cloudinary from 'cloudinary';
import Exercise from '../models/Exercise'; // Adjust the import path as needed
import { sendEmail } from '../utils/email'; // Adjust the import path as needed

export const logExercise = async (req, res) => {
    const { exerciseType, duration, distance, caloriesBurned } = req.body;
    const file = req.file; // Get the uploaded file

    try {
        // Validate request data
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        // Check user role
        if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'user')) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        let imageUrl = null;

        // Upload image if a file is provided
        if (file) {
            try {
                const result = await new Promise((resolve, reject) => {
                    cloudinary.v2.uploader.upload_stream(
                        { resource_type: 'image' },
                        (error, result) => {
                            if (error) {
                                return reject(error);
                            }
                            resolve(result);
                        }
                    ).end(file.buffer);
                });
                imageUrl = result.secure_url; // Store the image URL
            } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                return res.status(500).json({ success: false, message: 'Image upload failed' });
            }
        }

        // Create a new exercise entry
        const newExercise = new Exercise({
            userId: req.user._id,
            exerciseType,
            duration,
            distance,
            caloriesBurned,
            imageUrl, // Include the image URL if available
        });

        // Save the new exercise entry to the database
        await newExercise.save();
        
        // Send confirmation email
        await sendEmail(req.user.email, 'New Exercise Logged', 'You have logged a new exercise.');

        // Respond with success message
        res.status(201).json({ success: true, message: 'Exercise logged successfully' });
    } catch (error) {
        console.error('Error logging exercise:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
    }
};

// Controller for getting exercises
export const getExercises = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        let exercises;

        if (req.user.role === 'admin') {
            // Admin can get all exercises
            exercises = await Exercise.find({});
        } else {
            // Regular users can see exercises created by themselves or admins
            const adminUsers = await User.find({ role: 'admin' }).select('_id');
            const adminUserIds = adminUsers.map(user => user._id);

            exercises = await Exercise.find({
                $or: [
                    { userId: req.user._id },            // Exercises created by the user
                    { userId: { $in: adminUserIds } }    // Exercises created by admins
                ]
            });
        }

        if (exercises.length === 0) {
            return res.status(404).json({ success: true, message: 'No exercises found' });
        }

        res.status(200).json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getExerciseById = async (req, res) => {
    try {
        const exerciseId = req.params.id; // Get the ID from params
        const exercise = await Exercise.findById(exerciseId);

        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found.' });
        }

        res.status(200).json(exercise);
    } catch (error) {
        console.error('Error fetching exercise:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const trackExercise = async (req, res) => {
    const { exerciseId, duration, calories } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const newTracking = new Tracking({
            userId: req.user._id,
            exerciseId,
            duration,
            calories,
        });

        await newTracking.save();

        const user = await User.findById(req.user._id);
        if (user) {
            user.steps += 0; // Adjust steps if needed
            await user.save();
        }

        const dateTracked = new Date().toLocaleDateString();
        const subject = 'Exercise Tracked Successfully';
        const text = `You've tracked a new exercise on ${dateTracked}! Duration: ${duration} minutes, Calories burned: ${calories}.`;
        const html = `<p>You've tracked a new exercise on <strong>${dateTracked}</strong>!</p>
                      <p>Duration: <strong>${duration}</strong> minutes</p>
                      <p>Calories burned: <strong>${calories}</strong></p>`;

        await sendEmail(user.email, subject, text, html);

        res.status(201).json({
            success: true,
            message: 'Exercise tracked successfully',
            data: newTracking
        });
    } catch (error) {
        console.error('Error tracking exercise:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateExercise = async (req, res) => {
    const { id } = req.params;
    const { exerciseType, duration, distance, caloriesBurned } = req.body;
    const file = req.file; // Get the uploaded file if any
  
    try {
      // Find the exercise by ID
      const exercise = await Exercise.findById(id);
      if (!exercise) {
        return res.status(404).json({ success: false, message: 'Exercise not found' });
      }
  
      // Check authorization
      if (req.user.role !== 'admin' && req.user._id.toString() !== exercise.userId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
  
      let imageUrl = exercise.imageUrl; // Keep existing image URL if no new image is uploaded
  
      if (file) {
        try {
          // Upload new image to Cloudinary
          const result = await new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }).end(file.buffer);
          });
          imageUrl = result.secure_url;
        } catch (uploadError) {
          console.error('Error uploading image to Cloudinary:', uploadError);
          return res.status(500).json({ success: false, message: 'Image upload failed' });
        }
      }
  
      // Update the exercise
      exercise.exerciseType = exerciseType || exercise.exerciseType;
      exercise.duration = duration || exercise.duration;
      exercise.distance = distance || exercise.distance;
      exercise.caloriesBurned = caloriesBurned || exercise.caloriesBurned;
      exercise.imageUrl = imageUrl;
  
      await exercise.save();
  
      res.status(200).json({ success: true, message: 'Exercise updated successfully', exercise });
    } catch (error) {
      console.error('Error updating exercise:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

// Controller for deleting exercises
export const deleteExercise = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the exercise by ID
        const exercise = await Exercise.findById(id);
        if (!exercise) {
            return res.status(404).json({ success: false, message: 'Exercise not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && req.user._id.toString() !== exercise.userId.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Delete the exercise
        await Exercise.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Exercise deleted successfully' });
    } catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getAllUserProgress = async (req, res) => {
    try {
      const progress = await Tracking.find().populate('exerciseId').populate('userId');
      res.status(200).json(progress);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
