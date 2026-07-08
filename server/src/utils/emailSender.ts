import nodemailer, { Transporter } from 'nodemailer';

type MailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

export default class EmailSender {
  private transporter: Transporter;
  private from: string;

  constructor(smtpUrl?: string, from?: string) {
    // Allow passing full SMTP url or rely on env vars
    // Example SMTP_URL: smtp://user:pass@smtp.example.com:587
    const url = smtpUrl || process.env.SMTP_URL || '';

    // Nodemailer accepts a connection URL or config object
    this.transporter = nodemailer.createTransport(url || {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER || process.env.SMTP_USERNAME ? {
        user: process.env.SMTP_USER || process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
      } : undefined,
    });

    this.from = from || process.env.EMAIL_FROM || 'no-reply@example.com';
  }

  async sendMail(opts: MailOptions) {
    const mail = {
      from: opts.from || this.from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    };
    console.log("Sending email:", mail);
    const info = await this.transporter.sendMail(mail);
    console.log("Mail sent", info);
    return info;
  }

  // Sends a password reset email. token is included in a link to frontendUrl/reset-password?token=...
  async sendPasswordReset(token: string, to: string, options?: { frontendUrl?: string; expiresIn?: string }) {
    const frontend = options?.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
    const expiresIn = options?.expiresIn || process.env.PASSWORD_RESET_EXPIRES || '1h';

    const resetUrl = `${frontend.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;

    const subject = 'Password reset request';
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
        <h2>Password Reset</h2>
        <p>You requested to reset your password. Click the button below to continue. This link expires in ${expiresIn}.</p>
        <p style="text-align:center; margin:20px 0;">
          <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a>
        </p>
        <p>If the button doesn't work, copy and paste the following link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <hr />
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    return this.sendMail({ to, subject, html });
  }
}
