# Gmail SMTP Setup (Quick Test)

## Option 1: Gmail SMTP (Immediate Testing)

If you want to test real emails immediately without signing up for Resend:

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to your Google Account settings
2. Enable 2-Factor Authentication

### Step 2: Generate App Password
1. Go to Google Account > Security
2. Under "2-Step Verification", click "App passwords"
3. Generate a new app password for "Mail"
4. Copy the 16-character password

### Step 3: Add to .env.local
Add these lines to your `.env.local` file:

```env
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
FROM_EMAIL=MyHealthFirst <your-email@gmail.com>
```

### Step 4: Restart Server
```bash
npm run dev
```

### Step 5: Test
1. Go to `/dashboard/reports`
2. Export health data

## Option 2: Resend (Recommended for Production)

For production use, Resend is better:

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Get API key
4. Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=MyHealthFirst <noreply@healthfirst.com>
```

## Current Status

- ✅ PDF generation working
- ✅ Email template with attachments
- ✅ Mock email service (logs to console)
- ⏳ Real email delivery (requires Gmail or Resend setup)

## Testing

The system will automatically use:
1. **Resend** (if RESEND_API_KEY is set)
2. **Gmail SMTP** (if GMAIL_USER and GMAIL_APP_PASSWORD are set)
3. **Mock service** (if neither is set - logs to console) 