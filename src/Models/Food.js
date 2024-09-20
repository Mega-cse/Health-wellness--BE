
import mongoose from 'mongoose';

const FoodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  fats: { type: Number, required: true },
  carbohydrates: { type: Number, required: true },
});
export default mongoose.model('Food', FoodSchema);
