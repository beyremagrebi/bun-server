export function getEmailVerificationOtpContent(
  otp: string,
  verificationUrl: string,
) {
  const subject = "Verify Your Email – ThymSys OTP";

  const text = `Your OTP code is: ${otp}\nClick the link to verify: ${verificationUrl}\nThis code will expire in 5 minutes.`;

  const html = `
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

  return { subject, text, html };
}
