import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /.+\@.+\..+/ // Basic email format validation
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 // Ensuring a minimum password length
  },
  profilePicture: { type: String },
  fitnessGoals: { type: Map, of: Number },
  nutritionPreferences: { type: Map, of: String },
  age: { type: Number, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  location: { type: String, required: true, index: true },
  randomString: String,
  expirationTimestamp: Number,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
 
});

export default mongoose.model('User', UserSchema);
