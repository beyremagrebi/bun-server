export function getForgotPasswordEmailContent(resetLink: string) {
  const subject = "Reset Your Password – ThymSys";

  const text = `You requested to reset your password.\nClick the link below to proceed:\n${resetLink}\n\nIf you did not request this, please ignore this email.\nThis link will expire in 1 hour.`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #FF8C00;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password.</p>
      <p>Click the button below to choose a new password:</p>
      <a href="${resetLink}" style="
          display: inline-block;
          background-color: #FF8C00;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 10px;
        ">Reset Password</a>
      <p>This link will expire in <strong>1 hour</strong>.</p>
      <br/>
      <p>If you didn’t request a password reset, you can safely ignore this email.</p>
    </div>
  `;

  return { subject, text, html };
}
