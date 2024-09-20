
import express from 'express'
import { createFood, getFood,deleteFood,getStaticNutritionalData } from '../Controller/nutritionController.js';
const router = express.Router();
router.post('/',createFood)
router.get('/', getFood)
router.get('/static', getStaticNutritionalData); 
router.delete('/:id', deleteFood);
export default router;
