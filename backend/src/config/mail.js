import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER || 'dummy_user',
    pass: process.env.SMTP_PASS || 'dummy_pass',
  },
});

export const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"SNS NEST" <${process.env.SMTP_FROM || 'no-reply@sns-nest.com'}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error(`Mailer Error: ${error.message}. Continuing execution without failing.`);
    return null;
  }
};
