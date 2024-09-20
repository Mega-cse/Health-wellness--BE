import { sendEmail } from '../Services/emailService.js'; 
import User from '../Models/authModel.js';

// Admin Controller for sending personalized recommendations via email
export const sendPersonalizedRecommendations = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        // Fetch the user's email
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const emailSubject = 'Personalized Health Recommendations';
        const emailContent = `
Hello ${user.username},

Here are some personalized health recommendations for you:

1. Stay hydrated by drinking plenty of water.
2. Include a variety of fruits and vegetables in your diet.
3. Aim for at least 30 minutes of exercise each day.

Stay healthy and keep up the great work!

Best regards,
Your Health and Wellness Team
`;

        // Send the email
        await sendEmail(user.email, emailSubject, emailContent);
        res.status(200).json({ success: true, message: 'Personalized recommendations sent successfully' });
    } catch (error) {
        console.error('Error sending personalized recommendations:', error);
        res.status(500).json({ success: false, message: 'An error occurred while sending recommendations. Please try again later.' });
    }
};
