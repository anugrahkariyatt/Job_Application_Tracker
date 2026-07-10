import transporter from "../config/mail.config.js";

interface SendPasswordResetEmailProps {
  to: string;
  resetLink: string;
}

export const sendPasswordResetEmail = async ({
  to,
  resetLink,
}: SendPasswordResetEmailProps) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Reset Your Password",
    html: `
      <h2>Password Reset Request</h2>

      <p>You requested to reset your password.</p>

      <p>
        Click the link below to reset your password:
      </p>

      <a href="${resetLink}">
        Reset Password
      </a>

      <p>This link will expire in 15 minutes.</p>

      <p>If you didn't request a password reset, you can safely ignore this email.</p>
    `,
  });
};

export const sendVerificationEmail = async ({
  to,
  verificationLink,
}: {
  to: string;
  verificationLink: string;
}) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify Your Email",
    html: `
      <h2>Welcome!</h2>

      <p>Please verify your email by clicking the link below.</p>

      <a href="${verificationLink}">
        Verify Email
      </a>

      <p>This link expires in 24 hours.</p>
    `,
  });
};
