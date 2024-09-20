import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  fitnessGoals: { type: Map, of: Number },
  nutritionPreferences: { type: Map, of: String },
  mentalHealthLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MoodLog' }],
  age: { type: Number, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  location: { type: String, required: true },
  randomString: String,
  expirationTimestamp: Number,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  steps: { type: Number, default: 0 }, // Default steps count
  dailyGoal: { type: Number, default: 10000 }, // Default daily step goal
});

export default mongoose.model('User', UserSchema);
