import mongoose from 'mongoose';

// Define the Exercise Schema
const ExerciseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exerciseType: { type: String, required: true },
    duration: { type: Number, required: true }, // Duration in minutes
    distance: { type: Number },  
    caloriesBurned: { type: Number },
    imageUrl: { type: String }  // Add this field
});

// Define the Tracking Schema
const TrackingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
    duration: { type: Number, required: true }, // Duration in minutes
    calories: { type: Number, required: true },
    
    date: { type: Date, default: Date.now }
});

// Create models
const Exercise = mongoose.model('Exercise', ExerciseSchema);
const Tracking = mongoose.model('Tracking', TrackingSchema);

// Export models as a single object
const models = { Exercise, Tracking };
export default models;
