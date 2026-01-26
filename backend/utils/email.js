import { Resend } from 'resend';

// Get Resend API key from environment
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Initialize Resend client (will be null if API key is missing, checked at send time)
let resend = null;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
  console.log('✅ Resend email service initialized');
} else {
  console.warn('⚠️ RESEND_API_KEY is not set in environment variables. Email functionality will not work.');
}

/**
 * Send email using Resend
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.html - Email HTML content
 * @returns {Promise<Object>} Resend response
 */
export const sendEmail = async ({ to, subject, html }) => {
  if (!RESEND_API_KEY || !resend) {
    throw new Error('RESEND_API_KEY is not configured. Please set RESEND_API_KEY in your environment variables.');
  }

  try {
    const info = await resend.emails.send({
      from: process.env.MAIL_FROM || 'ResumeLab <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    // Check if Resend returned an error
    if (info.error) {
      throw new Error(`Resend Error: ${info.error.message}`);
    }

    console.log('✅ Email sent successfully via Resend:', info);
    return info;
  } catch (error) {
    console.error('❌ Error sending email via Resend:', error);
    // Log detailed error information for debugging
    if (error.response) {
      console.error('Resend API Error Details:', JSON.stringify(error.response.data, null, 2));
    } else if (error.message) {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};
