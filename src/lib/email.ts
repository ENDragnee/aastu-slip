import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT) || 587;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOnboardingEmail = async (
  email: string,
  name: string,
  token: string,
) => {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/auth/onboarding?token=${token}`;

  await transporter.sendMail({
    from: '"AASTU Admin" <no-reply@aastu.edu.et>',
    to: email,
    subject: "Activate your AASTU Account",
    html: `
      <h1>Welcome, ${name}</h1>
      <p>You have been registered. Click the link below to set your password:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
};
