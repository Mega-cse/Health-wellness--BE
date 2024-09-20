// src/services/emailService.js

import transporter from '../config/emailConfig.js';

export const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.MAIL,
    to,
    subject,
    text,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
