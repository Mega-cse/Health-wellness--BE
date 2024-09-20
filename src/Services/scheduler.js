import cron from 'node-cron';
import { sendEmail } from '../Services/emailService.js';
import { getMotivationalQuote } from '../Services/quotes.js';
import User from '../Models/authModel.js'; // Assuming you have a User model

// Function to send motivational quotes to all users
const sendDailyMotivationalQuotes = async () => {
    try {
        const users = await User.find(); // Fetch all users

        for (const user of users) {
            const quote = getMotivationalQuote();
            await sendEmail(user.email, 'Daily Motivational Quote', `Here's your daily dose of motivation:\n\n"${quote}"`);
        }
        console.log('Daily motivational quotes sent successfully.');
    } catch (error) {
        console.error('Error sending daily motivational quotes:', error);
    }
};

// Schedule the task to run daily at 8 AM
cron.schedule('0 8 * * *', sendDailyMotivationalQuotes);

