import nodemailer from 'nodemailer';
import axios from 'axios';

// Brevo SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send OTP via Brevo Template
export const sendOTPEmail = async (email, otp, type, ipAddress, location) => {
  try {
    const templateId = type === 'signup' ? 1 : 2;
    const subject = type === 'signup' 
      ? 'Verify Your Vyldo Account' 
      : 'Reset Your Vyldo Password';

    const requestTime = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      dateStyle: 'full',
      timeStyle: 'long',
    });

    // Send via Brevo API
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: process.env.SMTP_SENDER_NAME || 'Vyldo Freelancing Platform',
          email: process.env.SMTP_SENDER_EMAIL || 'vyldofreelancingplatform@gmail.com',
        },
        to: [{ email }],
        templateId,
        params: {
          OTP: otp,
          IP_ADDRESS: ipAddress || 'Unknown',
          LOCATION: location || 'Unknown',
          REQUEST_TIME: requestTime,
        },
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ OTP Email sent:', email);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error.response?.data || error.message);
    throw new Error('Failed to send OTP email');
  }
};

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});
