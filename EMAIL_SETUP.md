# Email Setup Guide

## Setting up Real Email Delivery

To receive actual emails with PDF attachments, you need to configure Resend (a modern email service).

### Step 1: Sign up for Resend

1. Go to [resend.com](https://resend.com)
2. Create a free account (100 emails/day free)
3. Verify your domain or use their test domain

### Step 2: Get your API Key

1. In your Resend dashboard, go to API Keys
2. Create a new API key
3. Copy the API key

### Step 3: Configure Environment Variables

Create or update your `.env.local` file:

```env
# Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=MyHealthFirst <noreply@yourdomain.com>
```

### Step 4: Test the Email System

1. Restart your development server
2. Go to `/dashboard/reports`
3. Export health data
4. Check your email for the PDF report

### Alternative Email Services

If you prefer other email services:

#### SendGrid
```bash
npm install @sendgrid/mail
```
Add to `.env.local`:
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

#### AWS SES
```bash
npm install aws-sdk
```
Add to `.env.local`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

### Current Status

- ✅ PDF generation working
- ✅ Email template with attachments
- ✅ Mock email service (logs to console)
- ⏳ Real email delivery (requires Resend setup)

### Testing Without Real Email

The current system logs all email details to the console. Check your terminal for:

```
📧 Mock Email Service - Sending email:
To: your-email@example.com
Subject: Health Data Shared - MyHealthFirst
📎 Attachments: health-data-report-2024-01-15.pdf
```

This shows the email would be sent with the PDF attachment. 