import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Initialize transporter with environment variables
    const secure = process.env.MAIL_SECURE === 'true' || process.env.SMTP_SECURE === 'true';
    const port = parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || '465', 10);
    const host = process.env.MAIL_HOST || process.env.SMTP_HOST || 'smtp.hostinger.com';
    const user = process.env.MAIL_USER || process.env.SMTP_USER;
    const pass = process.env.MAIL_PASSWORD || process.env.SMTP_PASSWORD;

    console.log('Initializing email with:', {
      host,
      port,
      secure,
      user,
      passLength: pass ? pass.length : 0,
      passFirstChar: pass ? pass[0] : 'N/A',
    });

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationToken: string,
  ): Promise<void> {
    const frontendBase =
      process.env.FRONTEND_BASE_URL || process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://compliancehub.ng' : 'http://localhost:5173');
    const verificationLink = `${frontendBase.replace(/\/$/, '')}/verify-email?token=${verificationToken}`;

    const htmlContent = `
      <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #2c2c2c; background-color: #f5f5f5;">
        <!-- Header -->
        <div style="background-color: #ffffff; padding: 40px 32px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #2c2c2c; margin-bottom: 4px; letter-spacing: -0.5px;">ComplianceHub</div>
          <p style="margin: 0; color: #73777f; font-size: 13px; font-weight: 500; letter-spacing: 0.3px;">Email Verification</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 48px 32px; background-color: #ffffff;">
          <p style="font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 600; color: #2c2c2c; margin: 0 0 16px 0; letter-spacing: -0.3px;">Hi ${firstName},</p>
          
          <p style="font-size: 15px; color: #5a6270; line-height: 1.6; margin: 0 0 32px 0; font-weight: 400;">
            Welcome to ComplianceHub! You're almost there. Let's verify your email address to complete your registration and unlock all the compliance management features.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 36px; background-color: #1ba154; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.3px; transition: all 0.3s ease; border: none; cursor: pointer;">
              Verify Email Address
            </a>
          </div>
          
          <p style="font-size: 12px; color: #8a8f95; line-height: 1.5; margin: 32px 0 16px 0; text-align: center; font-weight: 500;">
            Or copy and paste this link:
          </p>
          
          <div style="background-color: #f9f9fb; padding: 14px 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 0 0 32px 0;">
            <code style="word-break: break-all; font-size: 11px; color: #5a6270; font-family: 'SF Mono', 'Menlo', monospace; line-height: 1.4;">
              ${verificationLink}
            </code>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #d1e8d8; margin-bottom: 32px;">
            <p style="font-size: 13px; color: #1d5e3d; margin: 0; line-height: 1.5; font-weight: 500;">
              <strong style="color: #1d5e3d;">🔒 Security Notice:</strong> This link will expire in 24 hours. Never share this link with anyone.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
            <p style="font-size: 13px; color: #8a8f95; margin: 0; line-height: 1.6; font-weight: 400;">
              If you didn't sign up for ComplianceHub, you can safely ignore this email. If you have questions, our support team is here to help.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9f9fb; padding: 28px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #a0a6ad; margin: 0 0 10px 0; font-weight: 400;">ComplianceHub © 2025. All rights reserved.</p>
          <p style="font-size: 11px; color: #c1c5cb; margin: 0; font-weight: 400;">
            <a href="https://compliancehub.ng/help" style="color: #1ba154; text-decoration: none; font-weight: 500;">Need help?</a> • 
            <a href="https://compliancehub.ng/contact" style="color: #1ba154; text-decoration: none; font-weight: 500;">Contact Support</a>
          </p>
        </div>
      </div>
    `;

    const textContent = `
      Verify Your Email
      
      Hi ${firstName},
      
      Thank you for signing up for ComplianceHub! To complete your registration, please verify your email address by clicking the link below:
      
      ${verificationLink}
      
      This verification link will expire in 24 hours.
      
      If you did not create this account, you can safely ignore this email.
      
      ComplianceHub © 2025
    `;

    try {
      const result = await this.transporter.sendMail({
        from: `ComplianceHub <${process.env.MAIL_FROM || process.env.SMTP_FROM_EMAIL || process.env.MAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email - ComplianceHub',
        html: htmlContent,
        text: textContent,
      });
      
      console.log('Email sent successfully:', result.messageId);
    } catch (error) {
      console.error('Error sending verification email:', error);
      // In development, don't throw - just log
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Failed to send verification email');
      }
    }
  }

  async sendSupportTicketNotification(
    recipientEmail: string,
    recipientName: string,
    ticketId: string,
    ticketTitle: string,
    ticketDescription: string,
    submitterName: string,
    ticketPriority: string,
  ): Promise<void> {
    const backendBase = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://api.compliancehub.ng' : 'http://localhost:3000');
    const ticketLink = `${backendBase.replace(/\/$/, '')}/support/tickets/${ticketId}`;
    const priorityColor =
      ticketPriority === 'critical' ? '#dc2626' :
      ticketPriority === 'high' ? '#ea580c' :
      ticketPriority === 'medium' ? '#f59e0b' :
      '#10b981';

    const htmlContent = `
      <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #2c2c2c; background-color: #f5f5f5;">
        <!-- Header -->
        <div style="background-color: #ffffff; padding: 40px 32px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #2c2c2c; margin-bottom: 4px; letter-spacing: -0.5px;">ComplianceHub</div>
          <p style="margin: 0; color: #73777f; font-size: 13px; font-weight: 500; letter-spacing: 0.3px;">New Support Ticket</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 48px 32px; background-color: #ffffff;">
          <p style="font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 600; color: #2c2c2c; margin: 0 0 16px 0; letter-spacing: -0.3px;">Hi ${recipientName},</p>
          
          <p style="font-size: 15px; color: #5a6270; line-height: 1.6; margin: 0 0 32px 0; font-weight: 400;">
            A new support ticket has been submitted that requires your attention.
          </p>
          
          <!-- Ticket Info Card -->
          <div style="background-color: #f9f9fb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
              <div style="flex: 1;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #8a8f95; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Ticket ID</p>
                <p style="margin: 0; font-size: 14px; color: #2c2c2c; font-family: 'SF Mono', monospace; font-weight: 600;">${ticketId}</p>
              </div>
              <div style="flex: 1;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #8a8f95; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Priority</p>
                <p style="margin: 0; font-size: 14px; color: white; font-weight: 600; display: inline-block; padding: 4px 12px; background-color: ${priorityColor}; border-radius: 4px; text-transform: capitalize;">${ticketPriority}</p>
              </div>
            </div>
            
            <div style="margin-bottom: 16px;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #8a8f95; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Subject</p>
              <p style="margin: 0; font-size: 16px; color: #2c2c2c; font-weight: 600;">${ticketTitle}</p>
            </div>
            
            <div style="margin-bottom: 16px;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #8a8f95; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Submitted By</p>
              <p style="margin: 0; font-size: 14px; color: #2c2c2c; font-weight: 500;">${submitterName}</p>
            </div>
            
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #8a8f95; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Description</p>
              <p style="margin: 0; font-size: 14px; color: #5a6270; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;">${ticketDescription.substring(0, 200)}${ticketDescription.length > 200 ? '...' : ''}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${ticketLink}" style="display: inline-block; padding: 12px 36px; background-color: #1ba154; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.3px; transition: all 0.3s ease; border: none; cursor: pointer;">
              View Full Ticket
            </a>
          </div>
          
          <p style="font-size: 12px; color: #8a8f95; line-height: 1.5; margin: 32px 0 0 0; text-align: center; font-weight: 500;">
            This is an automated notification. Please respond directly in the ticket.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9f9fb; padding: 28px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #a0a6ad; margin: 0 0 10px 0; font-weight: 400;">ComplianceHub © 2025. All rights reserved.</p>
          <p style="font-size: 11px; color: #c1c5cb; margin: 0; font-weight: 400;">
            <a href="https://compliancehub.ng/help" style="color: #1ba154; text-decoration: none; font-weight: 500;">Need help?</a> • 
            <a href="https://compliancehub.ng/contact" style="color: #1ba154; text-decoration: none; font-weight: 500;">Contact Support</a>
          </p>
        </div>
      </div>
    `;

    const textContent = `
      New Support Ticket
      
      Hi ${recipientName},
      
      A new support ticket has been submitted that requires your attention.
      
      Ticket ID: ${ticketId}
      Priority: ${ticketPriority}
      Subject: ${ticketTitle}
      Submitted By: ${submitterName}
      
      Description:
      ${ticketDescription}
      
      View Full Ticket: ${ticketLink}
      
      This is an automated notification. Please respond directly in the ticket.
      
      ComplianceHub © 2025
    `;

    try {
      const result = await this.transporter.sendMail({
        from: `ComplianceHub <${process.env.MAIL_FROM || process.env.SMTP_FROM_EMAIL || process.env.MAIL_USER}>`,
        to: recipientEmail,
        subject: `[${ticketPriority.toUpperCase()}] New Support Ticket: ${ticketTitle}`,
        html: htmlContent,
        text: textContent,
      });
      
      console.log('Support ticket email sent successfully:', result.messageId);
    } catch (error) {
      console.error('Error sending support ticket email:', error);
      // In development, don't throw - just log
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Failed to send support ticket email');
      }
    }
  }
}
