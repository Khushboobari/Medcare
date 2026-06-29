const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
const senderEmail = process.env.SMTP_FROM_EMAIL || process.env.BREVO_SENDER_EMAIL || 'noreply@medcare.com';

const hasSmtpConfig = Boolean(smtpUser && smtpPass && smtpHost);

const createTransporter = () => {
  if (!hasSmtpConfig) return null;
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass }
  });
};

const transporter = createTransporter();

exports.sendOtpEmail = async (email, otpCode) => {
  const message = {
    from: senderEmail,
    to: email,
    subject: 'Your MedCare OTP code',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 24px; border-radius: 18px;">
        <h2 style="color:#0f172a; margin-bottom: 8px;">MedCare Verification Code</h2>
        <p style="margin:0 0 16px; color:#475569;">Use the secure one-time code below to sign in to your MedCare account. It expires in 5 minutes.</p>
        <div style="display:inline-flex; padding:18px 24px; border-radius:18px; background:#e0f2fe; color:#0369a1; font-size:26px; letter-spacing:0.2em; font-weight:700;">${otpCode}</div>
        <p style="margin-top:24px; color:#64748b; font-size:14px;">If you didn’t request this code, you can safely ignore this email.</p>
      </div>
    `
  };

  if (!transporter) {
    console.log(`\n[OTP Email Fallback] to=${email}, code=${otpCode}\n`);
    return { success: false, message: 'SMTP not configured. OTP logged to server console.' };
  }

  try {
    await transporter.sendMail(message);
    return { success: true, message: 'OTP email sent successfully.' };
  } catch (error) {
    console.error('sendOtpEmail error:', error);
    return { success: false, message: 'Failed to send OTP email, check SMTP configuration.' };
  }
};
