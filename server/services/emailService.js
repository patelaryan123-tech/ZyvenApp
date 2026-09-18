const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Configuration
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || (process.env.RESEND_API_KEY ? 'resend' : 'smtp');
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'ZYVEN Healthcare';
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@zyven.com';
const FROM_HEADER = `"${EMAIL_FROM_NAME}" <${EMAIL_FROM_ADDRESS}>`;
const REPLY_TO = process.env.EMAIL_REPLY_TO || `support@${EMAIL_FROM_ADDRESS.split('@')[1] || 'zyven.com'}`;

// 1. Initialize Providers
let resendClient = null;
let smtpTransporter = null;

if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

// Gmail / Standard SMTP Support
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;
const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);

if (smtpUser && smtpPass) {
  smtpTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for 587
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    headers: {
      'X-Entity-Ref-ID': Date.now().toString(),
      'X-Mailer': 'ZYVEN Healthcare Platform Mailer'
    }
  });
}

// 2. Base Email Layout Generator (Table-based, mobile responsive, high deliverability)
const generateEmailLayout = ({ title, preheader, contentHtml, isEmergency = false }) => {
  const primaryColor = isEmergency ? '#D90429' : '#3D5A45';
  const accentColor = '#E07A5F';
  const bgColor = '#FDFBF7';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: ${bgColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    td { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .email-container { max-width: 600px; margin: 0 auto; width: 100%; }
    .button { display: inline-block; padding: 14px 28px; background-color: ${primaryColor}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; text-align: center; }
    @media only screen and (max-width: 600px) {
      .responsive-table { width: 100% !important; }
      .content-padding { padding: 24px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 20px 0; background-color: ${bgColor};">
  ${preheader ? `<div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${bgColor};">
    <tr>
      <td align="center" style="padding: 10px 15px;">
        <table role="presentation" class="email-container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: ${primaryColor}; padding: 28px 20px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1.5px; color: #ffffff;">ZYVEN</h1>
                    <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600; color: ${accentColor}; letter-spacing: 0.8px; text-transform: uppercase;">
                      Healthcare Assistance System
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td class="content-padding" style="padding: 36px 32px; color: #1F2937; font-size: 15px; line-height: 1.6;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 24px 32px; border-top: 1px solid #E5E7EB; text-align: center; font-size: 12px; color: #6B7280; line-height: 1.5;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #374151;">ZYVEN Healthcare Platform</p>
              <p style="margin: 0 0 8px 0;">This is an automated operational notification regarding your ZYVEN account.</p>
              <p style="margin: 0; font-size: 11px; color: #9CA3AF;">&copy; ${new Date().getFullYear()} ZYVEN. All rights reserved. &bull; Secure Healthcare Delivery</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// 3. Main Sender Engine
const sendMail = async ({ to, subject, html, text, isEmergency = false }) => {
  if (!to) {
    console.warn('⚠️ [emailService] Send attempted without recipient email address.');
    return { success: false, message: 'Missing recipient email' };
  }

  // A. Resend Delivery
  if (resendClient) {
    try {
      const response = await resendClient.emails.send({
        from: FROM_HEADER,
        to: [to],
        reply_to: REPLY_TO,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, '').trim(),
        headers: isEmergency ? { 'X-Priority': '1 (Highest)', 'Importance': 'High' } : {}
      });
      console.log(`✅ [Resend] Email sent successfully to ${to}. ID: ${response.data?.id || 'delivered'}`);
      return { success: true, messageId: response.data?.id, provider: 'resend' };
    } catch (err) {
      console.error('❌ [Resend Error]:', err.message);
      if (!smtpTransporter) return { success: false, error: err.message };
    }
  }

  // B. SMTP / Gmail Delivery
  if (smtpTransporter) {
    try {
      const info = await smtpTransporter.sendMail({
        from: `"${EMAIL_FROM_NAME}" <${process.env.SMTP_USER || EMAIL_FROM_ADDRESS}>`,
        to,
        replyTo: REPLY_TO,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, '').trim(),
        priority: isEmergency ? 'high' : 'normal',
        headers: isEmergency ? { 'X-Priority': '1 (Highest)', 'Importance': 'High' } : {}
      });
      console.log(`✅ [SMTP/Gmail] Email sent successfully to ${to}. MessageID: ${info.messageId}`);
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } catch (err) {
      console.error('❌ [SMTP/Gmail Error]:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Safe Development Notice
  console.log(`ℹ️ [Email Simulation] Rendered for ${to}: "${subject}"`);
  return { success: true, simulated: true };
};

// 4. Send 6-Digit Email OTP (Option 1: 100% Free, High Deliverability)
const sendEmailOtp = async (email, otp, name = 'User') => {
  console.log(`\n==================================================`);
  console.log(`🔑 [ZYVEN EMAIL OTP]`);
  console.log(`📩 Recipient: ${email} (${name})`);
  console.log(`🔢 6-Digit OTP Code: ${otp}`);
  console.log(`⏰ Valid for 10 minutes`);
  console.log(`==================================================\n`);

  const subject = `Your ZYVEN Verification Code: ${otp}`;
  const preheader = `Use code ${otp} to verify your ZYVEN healthcare account.`;

  const contentHtml = `
    <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #1F2937;">Verify Your Email Address</h2>
    <p style="margin: 0 0 20px 0; color: #4B5563; font-size: 15px; line-height: 1.5;">
      Hello <strong>${name}</strong>,<br/>
      Thank you for creating an account with ZYVEN Healthcare. Please enter the 6-digit verification code below to activate your account:
    </p>

    <div style="text-align: center; margin: 28px 0; padding: 24px; background-color: #FDFBF7; border: 2px dashed #3D5A45; border-radius: 16px;">
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #3D5A45; display: inline-block;">
        ${otp}
      </span>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #6B7280; font-weight: 600;">
        ⏱️ This code will expire in 10 minutes.
      </p>
    </div>

    <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 13px;">
      If you did not request this verification code, you can safely ignore this email.
    </p>
  `;

  const plainText = `Hello ${name},\n\nYour ZYVEN email verification code is: ${otp}\n\nThis code is valid for 10 minutes.\n\nBest regards,\nZYVEN Healthcare Team`;

  const html = generateEmailLayout({ title: subject, preheader, contentHtml });
  return await sendMail({ to: email, subject, html, text: plainText });
};

// 5. Verification Link Email (Fallback)
const sendVerificationEmail = async ({ to, name = 'User', verificationLink }) => {
  const subject = 'Verify your ZYVEN account';
  const preheader = 'Complete your ZYVEN healthcare account setup with one click.';
  
  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #111827; font-weight: 800;">Hello ${name},</h2>
    <p style="margin: 0 0 16px 0;">Welcome to ZYVEN. Please verify your email address to complete your registration and activate your personal healthcare dashboard.</p>
    
    <div style="text-align: center; margin: 28px 0;">
      <a href="${verificationLink}" class="button" target="_blank">Verify Email Address</a>
    </div>

    <p style="font-size: 13px; color: #6B7280; margin: 20px 0 0 0; line-height: 1.5;">
      If the button above does not work, copy and paste this secure link into your web browser:<br />
      <a href="${verificationLink}" style="color: #3D5A45; word-break: break-all;">${verificationLink}</a>
    </p>

    <p style="font-size: 13px; color: #9CA3AF; margin: 16px 0 0 0;">
      If you did not register for an account on ZYVEN, you can safely disregard this email.
    </p>
  `;

  const plainText = `Hello ${name},\n\nWelcome to ZYVEN. Please verify your email address:\n${verificationLink}\n\nRegards,\nThe ZYVEN Team`;

  const html = generateEmailLayout({ title: subject, preheader, contentHtml });
  return await sendMail({ to, subject, html, text: plainText });
};

// 6. Welcome Email
const sendWelcomeEmail = async (user) => {
  if (!user || !user.email) return;
  const name = user.name || 'there';
  const role = user.role || 'Senior';
  const subject = 'Welcome to ZYVEN';
  const preheader = 'Your ZYVEN healthcare account is ready.';

  const contentHtml = `
    <h2 style="margin: 0 0 14px 0; font-size: 20px; color: #111827; font-weight: 800;">Hello ${name},</h2>
    <p style="margin: 0 0 16px 0;">Your ZYVEN account has been successfully created. We are honored to assist you with comprehensive healthcare monitoring and assistance.</p>

    <div style="background-color: #F9FAFB; border-radius: 12px; padding: 18px 20px; border: 1px solid #E5E7EB; margin: 20px 0;">
      <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #3D5A45; text-transform: uppercase; letter-spacing: 0.5px;">Account Summary</h4>
      <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Registered Email:</strong> ${user.email}</p>
      <p style="margin: 0; font-size: 14px;"><strong>Account Role:</strong> <span style="background-color: #eef3ef; color: #3D5A45; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 12px;">${role}</span></p>
    </div>

    <p style="margin: 0 0 12px 0;"><strong>Available Services on ZYVEN:</strong></p>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #4B5563;">
      <li><strong>Medication Management:</strong> Routine tracking & adherence scores</li>
      <li><strong>Hospital & Clinic Finder:</strong> 24/7 emergency & specialist directory</li>
      <li><strong>Government Schemes:</strong> Real-time eligibility calculator</li>
      <li><strong>Emergency SOS:</strong> Real-time alerts to registered contacts</li>
    </ul>

    <p style="margin: 20px 0 0 0;">Regards,<br /><strong>The ZYVEN Team</strong></p>
  `;

  const plainText = `Hello ${name},\n\nWelcome to ZYVEN. Your account has been successfully created.\nEmail: ${user.email}\nRole: ${role}\n\nRegards,\nThe ZYVEN Team`;

  const html = generateEmailLayout({ title: subject, preheader, contentHtml });
  return await sendMail({ to: user.email, subject, html, text: plainText });
};

// 7. Medication Reminder
const sendMedicationReminder = async (user, medication) => {
  if (!user || !user.email) return;
  const name = user.name || 'there';
  const medName = medication?.medicineName || 'Scheduled Medication';
  const dosage = medication?.dosage || 'Prescribed dose';
  const instructions = medication?.instructions || 'Take with water as prescribed.';
  const subject = `Medication Reminder: ${medName}`;
  const preheader = `Time to take your scheduled dose of ${medName}.`;

  const contentHtml = `
    <h2 style="margin: 0 0 14px 0; font-size: 20px; color: #111827; font-weight: 800;">Medication Reminder</h2>
    <p style="margin: 0 0 16px 0;">Hello <strong>${name}</strong>, this is your scheduled reminder to take your medication:</p>

    <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 6px 0; color: #166534; font-size: 18px;">${medName}</h3>
      <p style="margin: 0 0 6px 0; font-size: 14px; color: #14532D;"><strong>Dosage:</strong> ${dosage}</p>
      <p style="margin: 0; font-size: 13px; color: #15803D;"><strong>Instructions:</strong> ${instructions}</p>
    </div>

    <p>Please log in to your ZYVEN dashboard to confirm you have taken your medication.</p>
    <p>Stay healthy,<br /><strong>ZYVEN Care Team</strong></p>
  `;

  const plainText = `Medication Reminder\n\nHello ${name},\nTime to take: ${medName}\nDosage: ${dosage}\nInstructions: ${instructions}\n\nRegards,\nZYVEN Care Team`;

  const html = generateEmailLayout({ title: subject, preheader, contentHtml });
  return await sendMail({ to: user.email, subject, html, text: plainText });
};

// 8. Emergency Alert Email
const sendEmergencyAlert = async (event, contact) => {
  if (!contact || !contact.email) return;
  const patientName = event?.patientName || 'A senior user';
  const eventType = event?.eventType || 'Emergency SOS';
  const time = new Date(event?.createdAt || Date.now()).toLocaleTimeString();
  const locationUrl = event?.location?.latitude 
    ? `https://www.google.com/maps?q=${event.location.latitude},${event.location.longitude}` 
    : 'Location coordinates unavailable';

  const subject = `URGENT: ${eventType} Triggered by ${patientName}`;
  const preheader = `Emergency alert received from ${patientName}. Action required.`;

  const contentHtml = `
    <div style="background-color: #FEF2F2; border: 2px solid #D90429; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 8px 0; color: #D90429; font-size: 22px; font-weight: 900;">🚨 EMERGENCY ALERT</h2>
      <p style="margin: 0; color: #991B1B; font-size: 15px; font-weight: 700;">
        ${patientName} has triggered an ${eventType}.
      </p>
    </div>

    <p style="font-size: 15px; line-height: 1.6;">
      You are receiving this high-priority message because you are listed as an emergency contact for <strong>${patientName}</strong>.
    </p>

    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Alert Type:</strong> ${eventType}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Time Triggered:</strong> ${time}</p>
      ${event?.location?.latitude ? `
        <p style="margin: 0; font-size: 14px;">
          <strong>GPS Location:</strong> <a href="${locationUrl}" style="color: #D90429; font-weight: 700;" target="_blank">View on Google Maps &rarr;</a>
        </p>
      ` : ''}
    </div>

    <p style="font-size: 14px; color: #374151;">Please contact ${patientName} immediately or dispatch emergency medical services if needed.</p>
  `;

  const plainText = `EMERGENCY ALERT: ${patientName} triggered ${eventType} at ${time}.\nLocation: ${locationUrl}\n\nPlease check on them immediately.`;

  const html = generateEmailLayout({ title: subject, preheader, contentHtml, isEmergency: true });
  return await sendMail({ to: contact.email, subject, html, text: plainText, isEmergency: true });
};

// 9. Deliverability Test Email
const sendTestEmail = async (to) => {
  const subject = 'ZYVEN Email Deliverability Test';
  const preheader = 'Authentication and deliverability check for ZYVEN transactional email.';
  
  const contentHtml = `
    <h2 style="margin: 0 0 14px 0; font-size: 20px; color: #111827; font-weight: 800;">Email System Operational</h2>
    <p style="margin: 0 0 16px 0;">This email confirms that the ZYVEN transactional email pipeline is configured and delivering to your inbox.</p>

    <div style="background-color: #eef3ef; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Sender:</strong> ${EMAIL_FROM_ADDRESS}</p>
      <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Provider:</strong> ${EMAIL_PROVIDER}</p>
    </div>

    <p>Regards,<br /><strong>The ZYVEN Team</strong></p>
  `;

  const plainText = `ZYVEN Email Deliverability Test\nSender: ${EMAIL_FROM_ADDRESS}\nProvider: ${EMAIL_PROVIDER}`;
  const html = generateEmailLayout({ title: subject, preheader, contentHtml });
  return await sendMail({ to, subject, html, text: plainText });
};

module.exports = {
  sendMail,
  sendEmailOtp,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendMedicationReminder,
  sendEmergencyAlert,
  sendTestEmail
};
