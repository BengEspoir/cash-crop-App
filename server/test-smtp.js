require('dotenv').config();
const nodemailer = require('nodemailer');

const maskEmail = (value = '') => {
  const [local, domain] = String(value).split('@');
  if (!local || !domain) return value ? 'configured' : '(empty)';
  return `${local.slice(0, 1)}***${local.slice(-1)}@${domain}`;
};

const sanitizeError = (message = '') => {
  if (/535-5\.7\.8|Username and Password not accepted|Invalid login/i.test(message)) {
    return 'Gmail rejected the SMTP credentials. Use a valid Gmail App Password for SMTP_PASS, not the normal Gmail password.';
  }

  return message || 'SMTP test failed.';
};

async function testSmtp() {
  const verifyOnly = process.argv.includes('--verify-only');
  const explicitRecipient = process.argv.find((arg) => arg.startsWith('--to='))?.slice(5);
  const recipient = explicitRecipient || process.env.SMTP_TEST_TO || process.env.SMTP_USER;

  console.log('Testing SMTP configuration...');
  console.log('Host:', process.env.SMTP_HOST || '(empty)');
  console.log('Port:', process.env.SMTP_PORT || '(empty)');
  console.log('Secure:', process.env.SMTP_SECURE || 'false');
  console.log('User:', maskEmail(process.env.SMTP_USER));
  console.log('From:', process.env.EMAIL_FROM || '(empty)');
  console.log('Mode:', verifyOnly ? 'connection only' : 'connection + test email');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('SMTP connection successful.');

    if (verifyOnly) {
      return;
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: recipient,
      subject: 'AgriculNet SMTP Diagnostic',
      text: 'This is a diagnostic email from your AgriculNet server.',
      html: '<p>This is a diagnostic email from your AgriculNet server.</p>'
    });

    console.log('Test email accepted by SMTP provider.');
    console.log('Recipient:', maskEmail(recipient));
    console.log('Message ID:', info.messageId);
    console.log('Accepted:', (info.accepted || []).map(maskEmail).join(', ') || '(none)');
    console.log('Rejected:', (info.rejected || []).map(maskEmail).join(', ') || '(none)');
  } catch (error) {
    console.error('SMTP Error:', sanitizeError(error.message));
    if ((process.env.SMTP_HOST || '').includes('gmail.com')) {
      console.error('Gmail checklist: enable 2-Step Verification, create an App Password, paste that 16-character app password into SMTP_PASS, then restart the server.');
    }
    process.exitCode = 1;
  }
}

testSmtp();
