import sgMail from "@sendgrid/mail";
import { Logger } from "../config/logger";
import { EnvLoader } from "../config/env";
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
  throw new Error("SendGrid API key is missing in environment variables");
}
sgMail.setApiKey(SENDGRID_API_KEY);

type SendEmailOptions = {
  to: string;
  otp?: string;
  verificationUrl?: string;
  subject?: string;
  text?: string;
  html?: string;
};

export async function sendEmail({
  to,
  otp,
  verificationUrl,
  subject,
  text,
  html,
}: SendEmailOptions) {
  if (otp && verificationUrl && !text && !html) {
    subject = subject || "Verify Your Email – Proservices OTP";
    text = `Your OTP code is: ${otp}. Click the link to verify: ${verificationUrl}\nThis code will expire in 5 minutes.`;
    html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #FF8C00;">Email Verification</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) is:</p>
        <p style="font-size: 24px; font-weight: bold; color: #FF8C00;">${otp}</p>
        <p>Click the button below to verify your email:</p>
        <a href="${verificationUrl}" style="
            display: inline-block;
            background-color: #FF8C00;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 10px;
          ">Verify Email</a>
        <p>This code will expire in <strong>5 minutes</strong>.</p>
        <br/>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;
  }

  const msg = {
    to,
    from: EnvLoader.emailSender, // MUST be a verified sender on SendGrid
    subject: subject || "",
    text: text || "",
    html: html || "",
  };

  try {
    await sgMail.send(msg);
    Logger.success(`Email sent to ${to} successfully.`, false);
  } catch (error) {
    Logger.error(`Failed to send email: ${error}`);
  }
}
