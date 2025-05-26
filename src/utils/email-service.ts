import nodemailer from "nodemailer";
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
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "proservices.square@gmail.com",
      pass: "gumf ihse lxuv ynwk",
    },
  });

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

  const info = await transporter.sendMail({
    from: '"Proservices Team" <proservices.square@gmail.com>',
    to,
    subject,
    text,
    html,
  });

  console.log("Message sent: %s", info.messageId);
}
