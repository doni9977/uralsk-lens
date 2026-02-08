const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser;

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  if (!smtpHost || !smtpUser || !smtpPass) return null;

  cachedTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  return cachedTransporter;
}

async function sendMail({ to, subject, text }) {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('SMTP not configured');
  }

  return transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    text,
  });
}

module.exports = {
  sendMail,
};
