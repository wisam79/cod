const logger = require('../utils/logger');

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@mohemmaty.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Check if nodemailer is installed (optional dependency to avoid forcing installation)
let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  logger.warn('Nodemailer is not installed. SMTP email transport will not be available unless nodemailer is installed.');
}

/**
 * Sends an email using the configured provider.
 * Falls back to logging to console in development if no provider is configured.
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
async function sendEmail({ to, subject, text, html }) {
  const isDev = process.env.NODE_ENV !== 'production';

  // Log in development or if no email API/SMTP keys are set
  if (isDev && !RESEND_API_KEY && !process.env.SMTP_HOST) {
    logger.info(`[EMAIL LOG (Dev Mode)] To: ${to} | Subject: ${subject}`);
    logger.info(`[EMAIL TEXT] ${text}`);
    return { success: true, mode: 'console' };
  }

  // 1. Resend API
  if (RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to,
          subject,
          text,
          html
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Resend API returned status ${response.status}`);
      }

      const result = await response.json();
      logger.info(`Email sent successfully via Resend to ${to}`);
      return { success: true, messageId: result.id, provider: 'resend' };
    } catch (error) {
      logger.error(`Failed to send email via Resend: ${error.message}`);
      throw error;
    }
  }

  // 2. SMTP (via Nodemailer)
  if (process.env.SMTP_HOST) {
    if (!nodemailer) {
      const errMsg = 'SMTP_HOST is configured but nodemailer package is missing.';
      logger.error(errMsg);
      throw new Error(errMsg);
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const info = await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        text,
        html
      });

      logger.info(`Email sent successfully via SMTP to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } catch (error) {
      logger.error(`Failed to send email via SMTP: ${error.message}`);
      throw error;
    }
  }

  // Fallback if production and no provider configured
  const errMsg = 'No email provider configured (RESEND_API_KEY or SMTP_HOST). Email could not be sent.';
  logger.error(errMsg);
  throw new Error(errMsg);
}

/**
 * Sends a password reset email.
 * 
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 * @param {string} resetUrl - URL to reset password
 */
async function sendPasswordResetEmail(to, name, resetUrl) {
  const subject = 'مهمتي - استعادة كلمة المرور';
  
  const html = `
    <div dir="rtl" style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1e40af; margin: 0;">تطبيق مهمتي</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">نظام إدارة المهام للفريق</p>
      </div>
      
      <p>مرحباً <strong>${escapeHtml(name)}</strong>،</p>
      
      <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في تطبيق مهمتي. يمكنك القيام بذلك عن طريق الضغط على الزر أدناه:</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #1e40af; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">إعادة تعيين كلمة المرور</a>
      </div>
      
      <p style="color: #64748b; font-size: 14px;">إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.</p>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
    </div>
  `;

  const text = `مرحباً ${name}، لإعادة تعيين كلمة المرور الخاصة بك في تطبيق مهمتي، يرجى الانتقال إلى الرابط التالي: ${resetUrl}`;

  return sendEmail({ to, subject, text, html });
}

/**
 * Sends an email verification link.
 * 
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 * @param {string} verificationUrl - URL to verify email
 */
async function sendVerificationEmail(to, name, verificationUrl) {
  const subject = 'مهمتي - تفعيل حسابك';
  
  const html = `
    <div dir="rtl" style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1e40af; margin: 0;">تطبيق مهمتي</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">نظام إدارة المهام للفريق</p>
      </div>
      
      <p>مرحباً <strong>${escapeHtml(name)}</strong>،</p>
      
      <p>شكراً لتسجيلك في تطبيق مهمتي. لتفعيل حسابك والبدء في استخدام التطبيق، يرجى الضغط على الزر أدناه:</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verificationUrl}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">تفعيل الحساب</a>
      </div>
      
      <p style="color: #64748b; font-size: 14px;">إذا لم تقم بإنشاء حساب، يرجى تجاهل هذا البريد الإلكتروني.</p>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">تطبيق مهمتي لإدارة المهام والتواصل الفوري.</p>
    </div>
  `;

  const text = `مرحباً ${name}، لتفعيل حسابك في تطبيق مهمتي، يرجى الانتقال إلى الرابط التالي: ${verificationUrl}`;

  return sendEmail({ to, subject, text, html });
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationEmail
};
