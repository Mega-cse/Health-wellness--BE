
import Food from '../Models/Food.js';

// Static nutritional data for foods
const staticNutritionalData = {
    "apple": { calories: 95, protein: 0.5, fats: 0.3, carbohydrates: 25 },
    "banana": { calories: 105, protein: 1.3, fats: 0.3, carbohydrates: 27 },
    "chicken": { calories: 335, protein: 25, fats: 7.4, carbohydrates: 0 },
    "broccoli": { calories: 55, protein: 4, fats: 0.6, carbohydrates: 11 },
    "orange": { calories: 62, protein: 1.2, fats: 0.2, carbohydrates: 15 },
    "quinoa": { calories: 222, protein: 8.1, fats: 3.6, carbohydrates: 39 },
    "salmon": { calories: 206, protein: 22, fats: 13, carbohydrates: 0 },
    "spinach": { calories: 23, protein: 2.9, fats: 0.4, carbohydrates: 3.6 },
    "brown_rice": { calories: 215, protein: 5, fats: 1.6, carbohydrates: 45 },
    "almonds": { calories: 164, protein: 6, fats: 14, carbohydrates: 6 },
    "yogurt": { calories: 100, protein: 10, fats: 4, carbohydrates: 8 },
    "sweet_potato": { calories: 112, protein: 2, fats: 0.1, carbohydrates: 26 },
    "strawberries": { calories: 49, protein: 1, fats: 0.5, carbohydrates: 12 },
    "tofu": { calories: 76, protein: 8, fats: 4.8, carbohydrates: 2 },
    "egg": { calories: 68, protein: 6, fats: 5, carbohydrates: 0.6 },
    "potato": { calories: 130, protein: 2, fats: 0.2, carbohydrates: 30 },
    "cheddar_cheese": { calories: 113, protein: 7, fats: 9, carbohydrates: 1 },
    "grapes": { calories: 62, protein: 0.6, fats: 0.3, carbohydrates: 17 },
    "peanut_butter": { calories: 188, protein: 8, fats: 16, carbohydrates: 6 },
    "cabbage": { calories: 25, protein: 1.3, fats: 0.1, carbohydrates: 5 },
    // Add more foods as needed
};

// Create a new food entry
export const createFood = async (req, res) => {
    const { name } = req.body;

    // Normalize the food name to lowercase for matching
    const normalizedFoodName = name.toLowerCase();

    // Check if the food exists in the static data
    const nutritionData = staticNutritionalData[normalizedFoodName];

    if (!nutritionData) {
        return res.status(400).send('Error: Nutritional data not found for this food.');
    }

    try {
        const newFood = new Food({
            name: normalizedFoodName, // Store normalized name
            calories: nutritionData.calories,
            protein: nutritionData.protein,
            fats: nutritionData.fats,
            carbohydrates: nutritionData.carbohydrates,
        });

        await newFood.save();
        res.status(201).json(newFood);
    } catch (error) {
        res.status(400).send('Error adding food: ' + error.message);
    }
};

// Get static nutritional data
export const getStaticNutritionalData = (req, res) => {
    res.json(staticNutritionalData); // Send static data as response
};

// Get all food entries
export const getFood = async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (error) {
    res.status(500).send('Error fetching foods');
  }
};
// Delete a food entry by ID
export const deleteFood = async (req, res) => {
    const { id } = req.params; // Get the food ID from the request parameters
  
    try {
      const result = await Food.findByIdAndDelete(id); // Delete the food entry
  
      if (!result) {
        return res.status(404).send('Error: Food not found.');
      }
  
      res.status(200).send('Food deleted successfully.');
    } catch (error) {
      res.status(500).send('Error deleting food: ' + error.message);
    }
  };
  