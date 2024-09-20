import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalType: { type: String, required: true }, // e.g., Weight Loss, Distance Run
  targetValue: { type: Number, required: true }, // Target value for the goal
  currentValue: { type: Number, default: 0 }, // Current progress
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

export default mongoose.model('Goal', GoalSchema);
