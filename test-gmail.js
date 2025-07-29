const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testGmailConnection() {
  console.log('Testing Gmail connection...');
  console.log('GMAIL_USER:', process.env.GMAIL_USER);
  console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '***SET***' : 'NOT SET');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    // Test the connection
    await transporter.verify();
    console.log('✅ Gmail connection successful!');
    
    // Try to send a test email
    const result = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.GMAIL_USER,
      subject: 'Test Email from Health Tracker',
      html: '<p>This is a test email to verify Gmail configuration.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Gmail connection failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Make sure 2-Step Verification is enabled');
      console.log('2. Generate a new App Password for "Mail"');
      console.log('3. Copy the exact 16-character password');
      console.log('4. Don\'t use your regular Gmail password');
    }
  }
}

testGmailConnection(); 