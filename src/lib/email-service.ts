// Email service configuration
// This file can be easily integrated with real email services

import { Resend } from 'resend';
import { generateHealthDataPDF, generateHealthDataHTML, type HealthData } from './pdf-service';
import nodemailer from 'nodemailer';

export interface EmailContent {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Email service interface
export interface EmailService {
  sendEmail(content: EmailContent): Promise<EmailResult>;
}

// Gmail SMTP email service for testing
export class GmailEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
      },
    });
  }

  async sendEmail(content: EmailContent): Promise<EmailResult> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'MyHealthFirst <noreply@healthfirst.com>',
        to: content.to,
        subject: content.subject,
        html: content.html,
        text: content.text,
        attachments: content.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        }))
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Gmail SMTP error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Resend email service for production
export class ResendEmailService implements EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(content: EmailContent): Promise<EmailResult> {
    try {
      const result = await this.resend.emails.send({
        from: process.env.FROM_EMAIL || 'MyHealthFirst <onboarding@resend.dev>',
        to: content.to,
        subject: content.subject,
        html: content.html,
        text: content.text,
        attachments: content.attachments,
      });

      return {
        success: true,
        messageId: result.data?.id || `resend_${Date.now()}`
      };
    } catch (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Mock email service for development
export class MockEmailService implements EmailService {
  async sendEmail(content: EmailContent): Promise<EmailResult> {
    console.log('📧 Mock Email Service - Sending email:');
    console.log('To:', content.to);
    console.log('Subject:', content.subject);
    console.log('HTML Preview:', content.html.substring(0, 200) + '...');
    
    if (content.attachments) {
      console.log('📎 Attachments:', content.attachments.map(a => a.filename));
    }
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      messageId: `mock_${Date.now()}`
    };
  }
}

// SendGrid integration (uncomment and configure for production)
/*
import sgMail from '@sendgrid/mail';

export class SendGridEmailService implements EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async sendEmail(content: EmailContent): Promise<EmailResult> {
    try {
      const msg = {
        to: content.to,
        from: process.env.FROM_EMAIL!,
        subject: content.subject,
        html: content.html,
        text: content.text,
        attachments: content.attachments?.map(att => ({
          content: att.content.toString('base64'),
          filename: att.filename,
          type: att.contentType,
          disposition: 'attachment'
        }))
      };

      const response = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: response[0]?.headers['x-message-id'] || `sg_${Date.now()}`
      };
    } catch (error) {
      console.error('SendGrid error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
*/

// AWS SES integration (uncomment and configure for production)
/*
import AWS from 'aws-sdk';

export class SESEmailService implements EmailService {
  private ses: AWS.SES;

  constructor() {
    this.ses = new AWS.SES({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async sendEmail(content: EmailContent): Promise<EmailResult> {
    try {
      const params = {
        Source: process.env.FROM_EMAIL!,
        Destination: {
          ToAddresses: [content.to],
        },
        Message: {
          Subject: {
            Data: content.subject,
          },
          Body: {
            Html: {
              Data: content.html,
            },
            Text: {
              Data: content.text || content.html.replace(/<[^>]*>/g, ''),
            },
          },
        },
        Attachments: content.attachments?.map(att => ({
          Filename: att.filename,
          Content: att.content.toString('base64'),
          ContentType: att.contentType
        }))
      };

      const result = await this.ses.sendEmail(params).promise();
      
      return {
        success: true,
        messageId: result.MessageId
      };
    } catch (error) {
      console.error('SES error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
*/

// Export the email service instance
// Priority: Resend > Gmail > Mock
const resendApiKey = process.env.RESEND_API_KEY;
const gmailUser = process.env.GMAIL_USER;
const gmailPassword = process.env.GMAIL_APP_PASSWORD;

let selectedService: EmailService;

if (resendApiKey) {
  selectedService = new ResendEmailService();
} else if (gmailUser && gmailPassword) {
  selectedService = new GmailEmailService();
} else {
  selectedService = new MockEmailService();
}

export const emailService = selectedService;

// Helper function to send health data sharing notifications with PDF
export async function sendHealthDataSharingNotification(
  recipientEmail: string,
  recipientName: string,
  dataTypes: string[],
  sharedData: Record<string, unknown>,
  expiresInDays: number,
  patientName: string = 'Patient',
  birthdate?: Date,
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  },
  message?: string
): Promise<EmailResult> {
  const dataTypeLabels = {
    bloodPressure: 'Blood Pressure Records',
    bloodWork: 'Blood Work Results', 
    doctorVisits: 'Doctor Visits',
    weight: 'Weight & BMI Records',
    all: 'All Health Data'
  };

  const sharedDataTypes = dataTypes.map(type => dataTypeLabels[type as keyof typeof dataTypeLabels] || type).join(', ');
  
  // Generate PDF report
  const pdfBuffer = await generateHealthDataPDF({
    patientName,
    reportDate: new Date().toLocaleDateString(),
    dataTypes,
    sharedData,
    expiresInDays,
    birthdate,
    address
  });
  
  const emailContent: EmailContent = {
    to: recipientEmail,
    subject: `Health Data Shared - ${patientName} - MyHealthFirst`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Health Data Shared - MyHealthFirst</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 30px;
          }
          .data-summary {
            background: #f8fafc;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #667eea;
          }
          .data-summary h3 {
            color: #667eea;
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: 600;
          }
          .data-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
          }
          .data-item {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }
          .data-item h4 {
            margin: 0 0 8px 0;
            color: #667eea;
            font-size: 14px;
            font-weight: 600;
          }
          .data-item p {
            margin: 0;
            font-size: 12px;
            color: #666;
          }
          .personal-message {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .personal-message h3 {
            color: #856404;
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 600;
          }
          .personal-message p {
            margin: 0;
            color: #856404;
            font-style: italic;
          }
          .security-notice {
            background: #e8f4fd;
            border: 1px solid #bee3f8;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .security-notice h3 {
            color: #2b6cb0;
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 600;
          }
          .security-notice ul {
            margin: 0;
            padding-left: 20px;
            color: #2b6cb0;
          }
          .security-notice li {
            margin-bottom: 5px;
          }
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            margin: 0;
            font-size: 12px;
            color: #666;
          }
          .highlight {
            background: #667eea;
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 8px;
            }
            .header {
              padding: 30px 20px;
            }
            .content {
              padding: 30px 20px;
            }
            .data-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MyHealthFirst</h1>
            <p>Health Data Sharing Notification</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              <p>Hello <strong>${recipientName}</strong>,</p>
              <p>${patientName} has shared their health data with you through MyHealthFirst.</p>
            </div>
            
            ${message ? `
              <div class="personal-message">
                <h3>📝 Personal Message</h3>
                <p>"${message}"</p>
              </div>
            ` : ''}
            
            <div class="data-summary">
              <h3>📊 Shared Health Data Summary</h3>
              <div class="data-grid">
                ${Object.entries(sharedData).map(([type, records]) => {
                  const count = Array.isArray(records) ? records.length : 0;
                  if (count === 0) return '';
                  
                  const labels = {
                    bloodPressure: 'Blood Pressure',
                    bloodWork: 'Blood Work',
                    weight: 'Weight & BMI',
                    doctorVisits: 'Doctor Visits'
                  };
                  
                  return `
                    <div class="data-item">
                      <h4>${labels[type as keyof typeof labels] || type}</h4>
                      <p>${count} records shared</p>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
            
            <div class="security-notice">
              <h3>🔒 Security & Privacy</h3>
              <ul>
                <li>This data is shared securely via MyHealthFirst</li>
                <li>Access expires in <span class="highlight">${expiresInDays} days</span></li>
                <li>Please maintain patient confidentiality</li>
                <li>Follow HIPAA guidelines when handling this data</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #667eea; font-weight: 600; margin-bottom: 10px;">
                📎 Detailed PDF Report Attached
              </p>
              <p style="color: #666; font-size: 14px;">
                A comprehensive PDF report with all shared health data has been attached to this email.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from MyHealthFirst</p>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Please do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: `health-data-report-${patientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  return await emailService.sendEmail(emailContent);
} 