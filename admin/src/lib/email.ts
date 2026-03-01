import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // Use SSL for port 465
  auth: (process.env.SMTP_USER && process.env.SMTP_PASS) ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
};

// Create transporter with your SMTP settings
const transporter = nodemailer.createTransport(SMTP_CONFIG);

// Optional: Resend for backup
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Test email connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ SMTP Connection Error:', error.message);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

// Common email sender function
async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  const mailOptions = {
    from: options.from || process.env.EMAIL_FROM || '"NGO Platform" <ips.mahipatel@gmail.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message);
    
    // Fallback to Resend if available
    if (resend) {
      try {
        const resendResult = await resend.emails.send({
          from: options.from || process.env.EMAIL_FROM || 'noreply@yourdomain.in',
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
        });
        console.log(`✅ Email sent via Resend to ${options.to}`);
        return { success: true, messageId: resendResult.id, via: 'resend' };
      } catch (resendError) {
        console.error('❌ Resend also failed:', resendError);
      }
    }
    
    return { success: false, error: error.message };
  }
}

// ==================== AUTH EMAILS ====================

export async function sendWelcomeEmail(data: {
  to: string;
  companyName: string;
  adminName: string;
  portalUrl: string;
  companyDomain: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${data.companyName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .info-box { background: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0; }
        .info-box h3 { color: #007bff; margin-bottom: 15px; }
        .info-box p { margin: 8px 0; }
        .button { display: inline-block; background: #007bff; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .features { margin: 30px 0; }
        .features ul { list-style: none; }
        .features li { padding: 10px 0; padding-left: 25px; position: relative; }
        .features li:before { content: "✓"; color: #28a745; font-weight: bold; position: absolute; left: 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
        .highlight { background: #fff3cd; padding: 12px; border-radius: 4px; margin: 20px 0; border: 1px solid #ffc107; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${data.companyName}!</h1>
          <p>Your company portal is now active</p>
        </div>
        
        <div class="content">
          <p>Hi <strong>${data.adminName}</strong>,</p>
          
          <p>Congratulations! Your organization's portal has been successfully created and is ready to use.</p>
          
          <div class="info-box">
            <h3>Your Portal Details</h3>
            <p><strong>Company:</strong> ${data.companyName}</p>
            <p><strong>Domain:</strong> ${data.companyDomain}</p>
            <p><strong>Admin Email:</strong> ${data.to}</p>
            <p><strong>Portal URL:</strong> <a href="${data.portalUrl}">${data.portalUrl}</a></p>
          </div>
          
          <div class="highlight">
            <p><strong>Important:</strong> Employees can now join using emails ending with <code>@${data.companyDomain}</code></p>
          </div>
          
          <div class="features">
            <h3>As the Super Admin, you can:</h3>
            <ul>
              <li>Invite team members and manage permissions</li>
              <li>Set up SSO integration (Google/Microsoft)</li>
              <li>Configure organization settings and branding</li>
              <li>Manage user roles and departments</li>
              <li>Track activity and generate reports</li>
            </ul>
          </div>
          
          <p>
            <a href="${data.portalUrl}" class="button">
              Go to Admin Dashboard
            </a>
          </p>
          
          <div class="footer">
            <p><strong>Need help?</strong> Contact support at ${process.env.SMTP_USER || 'ips.mahipatel@gmail.com'}</p>
            <p><small>This is an automated message. Please do not reply to this email.</small></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: data.to,
    subject: `Welcome to ${data.companyName} - Your Portal is Ready`,
    html: html,
  });
}

export async function sendInvitationEmail(data: {
  to: string;
  inviterName: string;
  companyName: string;
  inviteLink: string;
  role: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitation to join ${data.companyName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #28a745; padding: 40px 20px; text-align: center; color: white; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .invite-box { background: #f8f9fa; border: 1px solid #dee2e6; padding: 25px; border-radius: 8px; margin: 25px 0; }
        .invite-box h3 { color: #28a745; margin-bottom: 15px; }
        .invite-box p { margin: 10px 0; }
        .button { display: inline-block; background: #28a745; color: white; padding: 16px 36px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border: 1px solid #ffc107; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Invited!</h1>
          <p>Join ${data.companyName}'s portal</p>
        </div>
        
        <div class="content">
          <p>Hello,</p>
          
          <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.companyName}</strong>'s organization portal.</p>
          
          <div class="invite-box">
            <h3>Invitation Details</h3>
            <p><strong>Your Role:</strong> ${data.role}</p>
            <p><strong>Invited By:</strong> ${data.inviterName}</p>
            <p><strong>Organization:</strong> ${data.companyName}</p>
            <p><strong>Invitation Link:</strong> <a href="${data.inviteLink}">Click here to accept</a></p>
          </div>
          
          <div class="warning">
            <p><strong>This invitation will expire in 7 days.</strong></p>
            <p>Click the button below to accept the invitation and set up your account:</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${data.inviteLink}" class="button">
              Accept Invitation & Set Up Account
            </a>
          </p>
          
          <p style="text-align: center; color: #6c757d; margin-top: 15px;">
            <small>Or copy this link: ${data.inviteLink}</small>
          </p>
          
          <div class="footer">
            <p><strong>Not expecting this invitation?</strong> Please ignore this email.</p>
            <p><small>This is an automated invitation from ${data.companyName}'s portal system.</small></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: data.to,
    from: `"${data.companyName}" <${process.env.SMTP_USER || 'ips.mahipatel@gmail.com'}>`,
    subject: `You're invited to join ${data.companyName}`,
    html: html,
  });
}

export async function sendPasswordResetEmail(data: {
  to: string;
  resetLink: string;
  userName?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #dc3545; padding: 40px 20px; text-align: center; color: white; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 16px 36px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .alert-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 6px; margin: 25px 0; }
        .alert-box h3 { color: #721c24; margin-bottom: 10px; }
        .steps { margin: 25px 0; }
        .steps ol { margin-left: 20px; }
        .steps li { margin: 10px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
          <p>Secure your account</p>
        </div>
        
        <div class="content">
          <p>Hi${data.userName ? ` <strong>${data.userName}</strong>` : ''},</p>
          
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          
          <p style="text-align: center;">
            <a href="${data.resetLink}" class="button">
              Reset Password
            </a>
          </p>
          
          <p style="text-align: center; color: #6c757d; margin-top: 10px;">
            <small>Or copy this link: ${data.resetLink}</small>
          </p>
          
          <div class="alert-box">
            <h3>Important Security Information</h3>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password will remain unchanged until you click the link above</li>
            </ul>
          </div>
          
          <div class="steps">
            <h3>Steps to reset your password:</h3>
            <ol>
              <li>Click the "Reset Password" button above</li>
              <li>Enter your new password (minimum 8 characters)</li>
              <li>Confirm your new password</li>
              <li>You will be automatically logged in with your new password</li>
            </ol>
          </div>
          
          <div class="footer">
            <p><strong>For security reasons:</strong> Never share this link with anyone.</p>
            <p><small>Need help? Contact support at ${process.env.SMTP_USER || 'ips.mahipatel@gmail.com'}</small></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: data.to,
    from: `"Account Security" <${process.env.SMTP_USER || 'ips.mahipatel@gmail.com'}>`,
    subject: 'Password Reset Request',
    html: html,
  });
}

// ==================== DONATION EMAILS (Keep your existing) ====================

export async function sendDonationEmail(data: {
  to: string;
  donorName: string;
  amount: number;
  currency?: string;
  donationId?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Your Donation</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 50px 20px; text-align: center; color: white; }
        .header h1 { font-size: 32px; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .amount-box { text-align: center; margin: 30px 0; padding: 25px; background: #f8f9fa; border-radius: 10px; }
        .amount { font-size: 48px; color: #28a745; font-weight: bold; margin: 10px 0; }
        .reference { color: #6c757d; font-size: 14px; margin-top: 10px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Generosity!</h1>
          <p>Your donation makes a difference</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${data.donorName}</strong>,</p>
          
          <p>On behalf of our entire team and everyone who will benefit from your generosity, we want to express our deepest gratitude for your donation.</p>
          
          <div class="amount-box">
            <p>Donation Amount:</p>
            <div class="amount">${data.currency || '₹'}${data.amount.toLocaleString()}</div>
            ${data.donationId ? `<p class="reference">Reference: ${data.donationId}</p>` : ''}
          </div>
          
          <p>Your contribution will directly support our mission and help us create positive change in our community. Every donation, no matter the size, brings us one step closer to achieving our goals.</p>
          
          <p>We are truly grateful for your trust and support.</p>
          
          <div class="footer">
            <p>With sincere gratitude,</p>
            <p><strong>The Team</strong></p>
            <p><small>This is an automated receipt. For any queries, please contact us.</small></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: data.to,
    from: `"NGO Connect" <${process.env.SMTP_USER || 'ips.mahipatel@gmail.com'}>`,
    subject: "Thank You for Your Donation!",
    html: html,
  });
}

// ==================== BULK INVITE SUMMARY ====================

export async function sendBulkInviteSummaryEmail(data: {
  to: string;
  adminName: string;
  companyName: string;
  totalInvited: number;
  successCount: number;
  failedEmails?: string[];
}) {
  const failedCount = data.totalInvited - data.successCount;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bulk Invite Summary</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #6f42c1; padding: 40px 20px; text-align: center; color: white; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .stats { display: flex; justify-content: center; gap: 30px; margin: 30px 0; }
        .stat-box { text-align: center; padding: 25px; border-radius: 10px; min-width: 150px; }
        .stat-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .stat-failed { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .stat-number { font-size: 36px; font-weight: bold; display: block; }
        .failed-list { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #dee2e6; }
        .failed-list h3 { color: #dc3545; margin-bottom: 15px; }
        .failed-list ul { list-style: none; }
        .failed-list li { padding: 8px 0; border-bottom: 1px dashed #dee2e6; }
        .button { display: inline-block; background: #6f42c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bulk Invite Complete</h1>
          <p>Summary of your recent bulk invitation</p>
        </div>
        
        <div class="content">
          <p>Hi <strong>${data.adminName}</strong>,</p>
          
          <p>Your bulk invitation request for <strong>${data.companyName}</strong> has been processed.</p>
          
          <div class="stats">
            <div class="stat-box stat-success">
              <span class="stat-number">${data.successCount}</span>
              <span>Success</span>
            </div>
            <div class="stat-box stat-failed">
              <span class="stat-number">${failedCount}</span>
              <span>Failed</span>
            </div>
          </div>
          
          ${data.failedEmails && data.failedEmails.length > 0 ? `
            <div class="failed-list">
              <h3>Failed Emails (${failedCount})</h3>
              <ul>
                ${data.failedEmails.map(email => `<li>${email}</li>`).join('')}
              </ul>
              <p><small>You can retry these invitations from your admin dashboard.</small></p>
            </div>
          ` : `
            <p style="text-align: center; color: #28a745; font-weight: 600;">
              ✅ All invitations sent successfully!
            </p>
          `}
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/users" class="button">
              View All Users in Admin Dashboard
            </a>
          </p>
          
          <div class="footer">
            <p><strong>Note:</strong> Invited users will receive individual emails with setup instructions. They can accept invitations within 7 days.</p>
            <p><small>This is an automated summary from ${data.companyName}'s portal system.</small></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: data.to,
    from: `"${data.companyName} Portal" <${process.env.SMTP_USER || 'ips.mahipatel@gmail.com'}>`,
    subject: `Bulk Invite Summary - ${data.totalInvited} users`,
    html: html,
  });
}

// ==================== TEST EMAIL FUNCTION ====================

export async function sendTestEmail(to: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .success { color: #28a745; font-size: 18px; }
      </style>
    </head>
    <body>
      <h1>✅ Test Email Successful</h1>
      <p>This is a test email from your NGO Management System.</p>
      <p>If you're receiving this, your email configuration is working correctly.</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
    </body>
    </html>
  `;

  const result = await sendEmail({
    to: to,
    subject: 'Test Email - NGO Management System',
    html: html,
  });

  return result;
}

// ==================== UTILITY FUNCTIONS ====================

export function formatEmailAddress(name: string, email: string) {
  return `"${name}" <${email}>`;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}