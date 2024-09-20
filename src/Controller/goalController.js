import Goal from '../Models/goalModel.js';
import User from '../Models/authModel.js';
import { sendEmail } from '../Services/emailService.js';
import cron from 'node-cron';
import mongoose from 'mongoose';

// Set Goal Function (General and Nutrition)
export const setGoal = async (req, res) => {
    const { goalType, targetValue, currentValue, startDate, endDate, userId } = req.body;

    try {
        let goalUserId = req.user._id;

        // Check if the user is an admin
        if (req.user.role === 'admin') {
            // Admin can set goals only for themselves
            if (userId && userId !== req.user._id.toString()) {
                return res.status(400).json({ success: false, message: 'Admin can only set goals for themselves' });
            }
            goalUserId = req.user._id;
        }

        const newGoal = new Goal({
            userId: goalUserId,
            goalType,
            targetValue,
            currentValue: currentValue || 0, // Default to 0 if not provided
            startDate,
            endDate
        });

        await newGoal.save();

        // Send an email notification about goal setting
        const user = await User.findById(goalUserId);
        if (user) {
            await sendEmail(
                user.email,
                'New Goal Set',
                `Congratulations! You have set a new goal: ${goalType}.`,
                `<p>Congratulations! You have set a new goal: <strong>${goalType}</strong>.</p>`
            );
        }

        res.status(201).json({ success: true, message: 'Goal set successfully' });
    } catch (error) {
        console.error('Error setting goal:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Goals Function (General and Nutrition)
export const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user._id });
        if (goals.length === 0) {
            return res.status(404).json({ success: true, message: 'No goals found' });
        }
        return res.status(200).json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Goal Function (General and Nutrition)
export const updateGoal = async (req, res) => {
    const { id } = req.params; // Goal ID from URL
    const { goalType, targetValue, currentValue, startDate, endDate } = req.body;

    try {
        const goal = await Goal.findById(id);
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        // Check if the user is allowed to update the goal
        if (req.user.role === 'admin' || goal.userId.toString() === req.user._id.toString()) {
            // Update the goal
            if (goalType) goal.goalType = goalType;
            if (targetValue !== undefined) goal.targetValue = targetValue;
            if (currentValue !== undefined) goal.currentValue = currentValue;
            if (startDate) goal.startDate = startDate;
            if (endDate) goal.endDate = endDate;

            await goal.save();

            res.status(200).json({ success: true, message: 'Goal updated successfully', goal });
        } else {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Goal Function (General and Nutrition)
export const deleteGoal = async (req, res) => {
    const { id } = req.params; // Goal ID from URL

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid goal ID' });
    }

    try {
        const goal = await Goal.findById(id);
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        // Check if the user is allowed to delete the goal
        if (req.user.role === 'admin' || goal.userId.toString() === req.user._id.toString()) {
            await Goal.findByIdAndDelete(id);
            return res.status(200).json({ success: true, message: 'Goal deleted successfully' });
        } else {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Function to send reminders for goals nearing their end date
const sendReminders = async () => {
    try {
        const now = new Date();
        const upcomingGoals = await Goal.find({
            endDate: { $gte: now },
            $expr: { $lt: [{ $subtract: ['$$endDate', now] }, 7 * 24 * 60 * 60 * 1000] } // Goals ending in less than a week
        });

        for (const goal of upcomingGoals) {
            const user = await User.findById(goal.userId);
            if (user) {
                await sendEmail(
                    user.email,
                    'Reminder: Your Goal is Approaching Its End Date',
                    `Your goal "${goal.goalType}" is approaching its end date. Please make sure to complete it.`,
                    `<p>Your goal "<strong>${goal.goalType}</strong>" is approaching its end date. Please make sure to complete it.</p>`
                );
            }
        }
    } catch (error) {
        console.error('Error sending reminders:', error);
    }
};

// Schedule the reminders to run daily at midnight
cron.schedule('0 0 * * *', sendReminders);

export const getGoalById = async (req, res) => {
  const { id } = req.params; // Goal ID from URL

  try {
      const goal = await Goal.findById(id);
      if (!goal) {
          return res.status(404).json({ success: false, message: 'Goal not found' });
      }

      // Check if the user is an admin or the owner of the goal
      if (req.user.role === 'admin' || goal.userId.toString() === req.user._id.toString()) {
          return res.status(200).json({ success: true, goal });
      } else {
          return res.status(403).json({ success: false, message: 'Access denied' });
      }
  } catch (error) {
      console.error('Error fetching goal by ID:', error);
      res.status(500).json({ success: false, message: error.message });
  }
};
