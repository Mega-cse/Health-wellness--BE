import User from '../Models/authModel.js'; // Import the User model
import models from '../Models/exerciseModel.js';
import Food from '../Models/Food.js'; // Import the Food model
const { Exercise, Tracking } = models;
import Goal from '../Models/goalModel.js';
// Define the adminDashboard function
export const adminDashboard = async (req, res) => {
    try {
        // Total number of users
        const totalUsers = await User.countDocuments();

        // Get usernames of all users
        const users = await User.find().select('username'); // Retrieve usernames only

        // Example: Get total number of exercises logged
        const totalExercises = await Exercise.countDocuments();

        // Example: Get total number of nutrition goals
        // const totalNutritionGoals = await NutritionGoal.countDocuments();

        // Example: Get total number of food entries
        const totalFoods = await Food.countDocuments();

        // Example: Get user statistics (e.g., average age)
        const averageAge = await User.aggregate([
            { $group: { _id: null, avgAge: { $avg: "$age" } } }
        ]);

        // Example: Get the most recent exercise entries
        const recentExercises = await Exercise.find().sort({ createdAt: -1 }).limit(5);

        // Example: Get the most recent nutrition goals
        //const recentNutritionGoals = await NutritionGoal.find().sort({ dateSet: -1 }).limit(5);

        // Example: Get the most recent food entries
        const recentFoods = await Food.find().sort({ createdAt: -1 }).limit(5);

        // Return the dashboard data
        res.status(200).json({
            totalUsers,
            users: users.map(user => user.username), // Include usernames in the response
            totalExercises,
            // totalNutritionGoals,
            totalFoods, // Include total foods in the response
            averageAge: averageAge[0]?.avgAge || 0,
            recentExercises,
            // recentNutritionGoals,
            recentFoods // Include recent foods in the response
        });
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// Get All User Progress Controller
export const getAllUserProgress = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    const progressData = await Promise.all(users.map(async (user) => {
      const userId = user._id;

      // Fetch user's completed exercises
      const completedExercises = await Tracking.find({ userId }).populate('exerciseId');

      // Fetch user's nutrition data
      const nutritionData = await Food.find({ userId });

      // Fetch user's goals
      const userGoals = await Goal.find({ userId });

      // Calculate exercise progress
      const totalCaloriesBurned = completedExercises.reduce((acc, exercise) => acc + (exercise.calories || 0), 0);

      // Calculate nutrition intake
      const totalCaloriesIntake = nutritionData.reduce((acc, food) => acc + food.calories, 0);

      // Prepare goal progress
      const goalProgress = userGoals.map(goal => {
        const completed = goal.currentValue; // Current progress from Goal model
        return {
          goalType: goal.goalType,
          targetValue: goal.targetValue,
          currentValue: completed,
          percentage: ((completed / goal.targetValue) * 100).toFixed(2) + '%',
        };
      });

      return {
        userId,
        username: user.username,
        exerciseProgress: {
          totalCaloriesBurned,
          completedExercises,
        },
        nutrition: {
          totalCaloriesIntake,
          entries: nutritionData,
        },
        goals: goalProgress,
      };
    }));

    res.status(200).json(progressData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get User Progress Controller
export const getUserProgress = async (req, res) => {
    const userId = req.params.userId; // Get the user ID from the request parameters
    console.log("Fetching user progress for userId:", req.params.userId);
   
    try {
      // Fetch the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Fetch user's completed exercises
      const completedExercises = await Tracking.find({ userId }).populate('exerciseId');
  
      // Fetch user's nutrition data
      const nutritionData = await Food.find({ userId });
  
      // Fetch user's goals
      const userGoals = await Goal.find({ userId });
  
      // Calculate exercise progress
      const totalCaloriesBurned = completedExercises.reduce((acc, exercise) => acc + (exercise.calories || 0), 0);
  
      // Calculate nutrition intake
      const totalCaloriesIntake = nutritionData.reduce((acc, food) => acc + food.calories, 0);
  
      // Prepare goal progress
      const goalProgress = userGoals.map(goal => {
        const completed = goal.currentValue; // Current progress from Goal model
        return {
          goalType: goal.goalType,
          targetValue: goal.targetValue,
          currentValue: completed,
          percentage: ((completed / goal.targetValue) * 100).toFixed(2) + '%',
        };
      });
  
      const progressData = {
        userId,
        username: user.username,
        exerciseProgress: {
          totalCaloriesBurned,
          completedExercises,
        },
        nutrition: {
          totalCaloriesIntake,
          entries: nutritionData,
        },
        goals: goalProgress,
      };
  
      res.status(200).json(progressData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
