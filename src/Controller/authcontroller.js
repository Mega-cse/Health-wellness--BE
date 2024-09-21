import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../Models/authModel.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const register = async (req, res) => {
  const { username, email, password, age, height, weight, location, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      age,
      height,
      weight,
      location,
      role // Role assignment
    });
    await newUser.save();
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1h' });

    // Set the token in a cookie
    res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None', // Set to 'None' for cross-origin requests
});


    // res.json({ success: true, message: 'Logged in successfully', user: { role: user.role } });
    res.json({ success: true, message: 'Logged in successfully', user: { role: user.role }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a reset token and set expiration
        const randomString = crypto.randomBytes(20).toString('hex');
        const expirationTimestamp = Date.now() + 3600000; // 1 hour

        user.randomString = randomString;
        user.expirationTimestamp = expirationTimestamp;
        await user.save();

        // Set up email transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.MAIL,
                pass: process.env.SECRET_KEY
            }
        });

        // Construct the reset URL
        const resetURL = `${process.env.RESET_URL}/reset-password/${randomString}`;
        
        // Send email
        await transporter.sendMail({
            from: process.env.MAIL,
            to: user.email,
            subject: 'Password Reset Request',
            text: `Dear ${user.username},\n\nYou requested a password reset. Please use the following link to reset your password:\n${resetURL}\n\nThis link will expire in 1 hour. If you did not request a password reset, please ignore this email.`,
            html: `<p>Dear ${user.username},</p>
                   <p>You requested a password reset. Please use the following link to reset your password:</p>
                   <p><a href="${resetURL}">${resetURL}</a></p>
                   <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>`
        });

        res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (error) {
        console.error("Error in forgetPassword:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


//ResetPassword
export const resetPassword = async (req, res) => {
  try {
      const { token } = req.params;
      const { newPassword } = req.body;

      console.log('Received token:', token);
      console.log('Current time:', Date.now());

      const user = await User.findOne({
          randomString: token,
          expirationTimestamp: { $gt: Date.now() }
      });

      if (!user) {
          console.log('User not found or token expired');
          return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      if (!newPassword) {
          return res.status(400).json({ message: "New password is required" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.randomString = null;
      user.expirationTimestamp = null;
      await user.save();

      res.status(200).json({ message: "Your new password has been updated" });
  } catch (error) {
      console.error("Error in resetPassword:", error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Logout User
export const logoutUser = (req, res) => {
  try {
    // Clear the token cookie
    res.cookie('token', '', {
      httpOnly: true, // Ensure the cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
      sameSite: 'Strict', // Helps prevent CSRF attacks
      expires: new Date(0) // Expire the cookie immediately
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get the authenticated user's profile
export const UserProfile = async (req, res) => {
    const token = req.cookies.token; // Retrieve the token from cookies
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY); // Decode the token
        const user = await User.findById(decoded.id).select('-password'); // Exclude password

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
// Get all user profiles (Admin only)
export const getAllUserProfiles = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    if (!users.length) return res.status(404).json({ success: false, message: 'No users found' });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// Get User Profile by ID (Admin only)
export const getUserProfileById = async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from URL parameters
    const user = await User.findById(userId); // Fetch user by ID

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Exclude sensitive information like password
    const { password, ...userProfile } = user._doc;
    res.json({ success: true, user: userProfile }); // Return the user profile without password
  } catch (error) {
    console.error('Error fetching user profile by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function to handle updating user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the request parameters
    const updates = req.body; // Get the updates from the request body

    // Handle the uploaded profile picture
    if (req.file) {
      const profilePictureUrl = await saveProfilePicture(req.file); // Save the file and get the URL
      updates.profilePicture = profilePictureUrl; // Set the profile picture URL in updates
    }

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Destructure to remove sensitive data (like password)
    const { password, ...userProfile } = updatedUser._doc;
    
    res.status(200).json(userProfile); // Send the updated user profile back to the client
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Function to save the profile picture
const saveProfilePicture = async (file) => {
  // Generate a unique filename
  const filename = `${uuidv4()}_${file.originalname}`;
  const uploadDir = path.join(__dirname, '../uploads/profilePictures'); // Adjust the path as necessary

  // Create the directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Write the file to the filesystem
  const filePath = path.join(uploadDir, filename);
  await fs.promises.writeFile(filePath, file.buffer);

  // Return the relative URL for the profile picture
  return `/uploads/profilePictures/${filename}`; // Adjust this path as necessary for your frontend
};
