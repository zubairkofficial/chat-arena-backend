import { User } from '../../user/entities/user.entity';

const nodemailer = require('nodemailer');
require('dotenv').config();

// Create the transporter object using SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: false, // use SSL
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendMailToVerifyUser = async (user: User, verifyLink: string) => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f8f8f8;
          padding: 20px;
          text-align: center;
        }
        .container {
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          margin: 0 auto;
        }
        h1 {
          color: #031a2e;
        }
        p {
          color: #666;
        }
        .button {
          display: inline-block;
          padding: 15px 20px;
          margin-top: 20px;
          background: linear-gradient(180deg, #00b300, #006600);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        }
        .button:hover {
          background: linear-gradient(180deg, #006600, #003300);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to Chat Arena, <strong>${user.name}</strong>!</h1>
        <p>Thank you for signing up. Please verify your email address by clicking the button below.</p>
        <a href="${verifyLink}" class="button">Verify Your Email</a>
        <p>This link will expire in 1 hour.</p>
      </div>
    </body>
  </html>
  `;
  sendEmail(user.email, 'Verify Email', verifyLink, html);
};

export const sendMailToResetPassword = async (
  user: User,
  resetLink: string,
) => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Password Reset Request</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f8f8f8;
          padding: 20px;
          text-align: center;
        }
        .container {
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          margin: 0 auto;
        }
        h1 {
          color: #031a2e;
        }
        p {
          color: #666;
        }
        .button {
          display: inline-block;
          padding: 15px 20px;
          margin-top: 20px;
          background: linear-gradient(180deg, #00b300, #006600);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        }
        .button:hover {
          background: linear-gradient(180deg, #006600, #003300);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Password Reset Request</h1>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>We received a request to reset your password. You can reset your password by clicking the button below:</p>
        <a href="${resetLink}" class="button">Reset Your Password</a>
        <p>This link will expire in 1 hour.</p>
      </div>
    </body>
  </html>
  `;
  sendEmail(user.email, 'Reset Your Password', resetLink, html);
};
// Send email function
const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
) => {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.MAIL_FROM_ADDRESS}`, // Sender address
      to,
      subject,
      text,
      html,
    });
    console.log('Message sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email'); // Rethrow the error for the caller to handle
  }
};
