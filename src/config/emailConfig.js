// src/config/emailConfig.js

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your preferred email service
    auth: {
        user: process.env.MAIL,
        pass: process.env.SECRET_KEY
    }
});

export default transporter;
