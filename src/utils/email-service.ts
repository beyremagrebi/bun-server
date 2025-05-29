import sgMail from "@sendgrid/mail";
import { Logger } from "../config/logger";
import { EnvLoader } from "../config/env";
import { getEmailVerificationOtpContent } from "../templates/otp-verification-email";
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
  throw new Error("SendGrid API key is missing in environment variables");
}
sgMail.setApiKey(SENDGRID_API_KEY);

type SendEmailOptions = {
  to: string;
  otp?: string;
  subject?: string;
  text?: string;
  html?: string;
};

export async function sendEmail({
  to,
  otp,
  subject,
  text,
  html,
}: SendEmailOptions) {
  if (otp && !text && !html) {
    const result = getEmailVerificationOtpContent(
      otp,
      EnvLoader.verficationUrl,
    );
    subject = result.subject;
    text = result.text;
    html = result.html;
  }

  const msg = {
    to,
    from: EnvLoader.emailSender,
    subject: subject || "",
    text: text || "",
    html: html || "",
  };

  await sgMail.send(msg);
  Logger.success(`Email sent to ${to} successfully.`, false);
}
