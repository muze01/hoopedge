import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// const fromEmail = process.env.EMAIL_FROM || 'noreply@hoopedge.com';
const fromEmail = process.env.EMAIL_FROM!;
const appName = "HoopEdge"; // Change this to your app name
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const emailService = {
  // Send password reset email
  sendPasswordResetEmail: async (email: string, resetUrl: string) => {
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `Reset Your ${appName} Password`,
        html: `
                    <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>

  <body
    style="
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      color: #111827;
      background-color: #f9fafb;
      margin: 0;
      padding: 24px;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="max-width: 600px; margin: 0 auto;"
    >
      <tr>
        <td>
          <!-- Header -->
          <div
            style="
              background-color: #2563eb;
              padding: 28px;
              text-align: center;
              border-radius: 12px 12px 0 0;
            "
          >
            <h1
              style="
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: 700;
              "
            >
              Reset your password
            </h1>
          </div>

          <!-- Body -->
          <div
            style="
              background-color: #ffffff;
              padding: 32px;
              border-radius: 0 0 12px 12px;
              border: 1px solid #e5e7eb;
            "
          >
            <p style="font-size: 15px; margin-bottom: 20px;">
              Hello,
            </p>

            <p style="font-size: 15px; margin-bottom: 20px;">
              We received a request to reset the password for your
              <strong>${appName}</strong> account.
            </p>

            <p style="font-size: 15px; margin-bottom: 28px;">
              Click the button below to set a new password:
            </p>

            <!-- CTA -->
            <div style="text-align: center; margin: 32px 0;">
              <a
                href="${resetUrl}"
                style="
                  background-color: #2563eb;
                  color: #ffffff;
                  padding: 14px 32px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 15px;
                  display: inline-block;
                "
              >
                Reset password
              </a>
            </div>

            <p
              style="
                font-size: 13px;
                color: #6b7280;
                margin-bottom: 12px;
              "
            >
              Or copy and paste this link into your browser:
            </p>

            <p
              style="
                font-size: 13px;
                color: #2563eb;
                word-break: break-all;
                background-color: #f1f5f9;
                padding: 12px;
                border-radius: 6px;
              "
            >
              ${resetUrl}
            </p>

            <!-- Divider -->
            <div
              style="
                margin-top: 32px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              "
            >
              <p style="font-size: 13px; color: #6b7280; margin-bottom: 10px;">
                <strong>Security note:</strong> This link will expire in
                <strong>1 hour</strong>.
              </p>

              <p style="font-size: 13px; color: #6b7280;">
                If you didn’t request a password reset, you can safely ignore
                this email. Your password will remain unchanged.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div
            style="
              text-align: center;
              margin-top: 16px;
              font-size: 12px;
              color: #9ca3af;
            "
          >
            <p>
              © ${new Date().getFullYear()} ${appName}. All rights reserved.
            </p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
                `,
      });

      if (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Failed to send password reset email");
      }

      console.log("Password reset email sent:", data);
      return data;
    } catch (error) {
      console.error("Error in sendPasswordResetEmail:", error);
      throw error;
    }
  },

  // Send email verification email
  sendVerificationEmail: async (email: string, verificationUrl: string) => {
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `Verify Your ${appName} Email Address`,
        html: `
                    <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>

  <body
    style="
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      color: #111827;
      background-color: #f9fafb;
      margin: 0;
      padding: 24px;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="max-width: 600px; margin: 0 auto;"
    >
      <tr>
        <td>
          <!-- Header -->
          <div
            style="
              background-color: #2563eb;
              padding: 28px;
              text-align: center;
              border-radius: 12px 12px 0 0;
            "
          >
            <h1
              style="
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: 700;
              "
            >
              Verify your email
            </h1>
          </div>

          <!-- Body -->
          <div
            style="
              background-color: #ffffff;
              padding: 32px;
              border-radius: 0 0 12px 12px;
              border: 1px solid #e5e7eb;
            "
          >
            <p style="font-size: 15px; margin-bottom: 20px;">
              Welcome to <strong>${appName}</strong>,
            </p>

            <p style="font-size: 15px; margin-bottom: 20px;">
              Thanks for signing up. To finish setting up your account and start
              using HoopEdge analytics, please verify your email address.
            </p>

            <!-- CTA -->
            <div style="text-align: center; margin: 32px 0;">
              <a
                href="${verificationUrl}"
                style="
                  background-color: #2563eb;
                  color: #ffffff;
                  padding: 14px 32px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 15px;
                  display: inline-block;
                "
              >
                Verify email address
              </a>
            </div>

            <p
              style="
                font-size: 13px;
                color: #6b7280;
                margin-bottom: 12px;
              "
            >
              Or copy and paste this link into your browser:
            </p>

            <p
              style="
                font-size: 13px;
                color: #2563eb;
                word-break: break-all;
                background-color: #f1f5f9;
                padding: 12px;
                border-radius: 6px;
              "
            >
              ${verificationUrl}
            </p>

            <!-- Divider -->
            <div
              style="
                margin-top: 32px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              "
            >
              <p style="font-size: 13px; color: #6b7280; margin-bottom: 10px;">
                <strong>Note:</strong> This verification link will expire in
                <strong>24 hours</strong>.
              </p>

              <p style="font-size: 13px; color: #6b7280;">
                If you didn’t create an account with ${appName}, you can safely
                ignore this email.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div
            style="
              text-align: center;
              margin-top: 16px;
              font-size: 12px;
              color: #9ca3af;
            "
          >
            <p>
              © ${new Date().getFullYear()} ${appName}. All rights reserved.
            </p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>

                `,
      });

      if (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Failed to send verification email");
      }

      console.log("Verification email sent:", data);
      return data;
    } catch (error) {
      console.error("Error in sendVerificationEmail:", error);
      throw error;
    }
  },

  // Send welcome email (after successful verification)
  sendWelcomeEmail: async (email: string, name: string) => {
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `Welcome to ${appName}!`,
        html: `
                   <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>

  <body
    style="
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      color: #111827;
      background-color: #f9fafb;
      margin: 0;
      padding: 24px;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="max-width: 600px; margin: 0 auto;"
    >
      <tr>
        <td>
          <!-- Header -->
          <div
            style="
              background-color: #2563eb;
              padding: 28px;
              text-align: center;
              border-radius: 12px 12px 0 0;
            "
          >
            <h1
              style="
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: 700;
              "
            >
              Welcome to ${appName}
            </h1>
          </div>

          <!-- Body -->
          <div
            style="
              background-color: #ffffff;
              padding: 32px;
              border-radius: 0 0 12px 12px;
              border: 1px solid #e5e7eb;
            "
          >
            <p style="font-size: 15px; margin-bottom: 20px;">
              Hi ${name},
            </p>

            <p style="font-size: 15px; margin-bottom: 20px;">
              Your email has been successfully verified. Your account is now
              fully active and ready to use.
            </p>

            <p style="font-size: 15px; margin-bottom: 28px;">
              You can now explore <strong>HoopEdge</strong> analytics — starting
              with half-time performance insights, odds behavior, and team
              tendencies.
            </p>

            <!-- CTA -->
            <div style="text-align: center; margin: 32px 0;">
              <a
                href="${appUrl}/dashboard"
                style="
                  background-color: #2563eb;
                  color: #ffffff;
                  padding: 14px 32px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 15px;
                  display: inline-block;
                "
              >
                Open dashboard
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              If you have any questions or feedback, feel free to reach out —
              we’re building HoopEdge with serious bettors and analysts in mind.
            </p>
          </div>

          <!-- Footer -->
          <div
            style="
              text-align: center;
              margin-top: 16px;
              font-size: 12px;
              color: #9ca3af;
            "
          >
            <p>
              © ${new Date().getFullYear()} ${appName}. All rights reserved.
            </p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>

                `,
      });

      if (error) {
        console.error("Error sending welcome email:", error);
        // Don't throw here - welcome email is not critical
      }

      console.log("Welcome email sent:", data);
      return data;
    } catch (error) {
      console.error("Error in sendWelcomeEmail:", error);
      // Don't throw - welcome email is not critical
    }
  },
};
