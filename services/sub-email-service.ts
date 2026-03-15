const appName = "HoopEdge";
const appUrl =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL
    : process.env.NEXT_PUBLIC_APP_URL_LOCAL;

interface RenewalReminderProps {
  userName: string;
  daysLeft: number;
  endDate: Date;
  interval: string;
  amount: number;
  currency: string;
}

interface ExpiredProps {
  userName: string;
}

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£" };
  const symbol = symbols[currency] ?? currency;
  return `${symbol}${amount.toLocaleString()}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function baseTemplate(headerTitle: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111827; background-color: #f9fafb; margin: 0; padding: 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
      <tr>
        <td>
          <!-- Header -->
          <div style="background-color: #2563eb; padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
              ${headerTitle}
            </h1>
          </div>

          <!-- Body -->
          <div style="background-color: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            ${content}
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 16px; font-size: 12px; color: #9ca3af;">
            <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

export function renewalReminderEmail({
  userName,
  daysLeft,
  endDate,
  interval,
  amount,
  currency,
}: RenewalReminderProps): { subject: string; html: string } {
  const subject =
    daysLeft === 1
      ? `⚠️ Your ${appName} Pro subscription expires tomorrow`
      : `Your ${appName} Pro subscription expires in ${daysLeft} days`;

  const html = baseTemplate(
    daysLeft === 1
      ? "Your subscription expires tomorrow"
      : `Your subscription expires in ${daysLeft} days`,
    `
    <p style="font-size: 15px; margin-bottom: 20px;">Hi ${userName},</p>

    <p style="font-size: 15px; margin-bottom: 20px;">
      Your <strong>${appName} Pro</strong> subscription expires on
      <strong>${formatDate(endDate)}</strong>. Renew now to keep uninterrupted
      access to all picks, analytics, and insights.
    </p>

    <!-- Subscription details -->
    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 28px;">
      <p style="margin: 0; font-size: 14px; color: #6b7280;">Current plan</p>
      <p style="margin: 4px 0 0; font-size: 15px; font-weight: 600; color: #111827;">
        ${appName} Pro · ${interval === "yearly" ? "Annual" : "Monthly"} · ${formatCurrency(amount, currency)}
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${appUrl}/billing"
         style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
        Renew Subscription
      </a>
    </div>

    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 13px; color: #6b7280;">
        After expiry your account will revert to the free plan. All your data stays
        safe — you just won't have access to Pro features until you renew.
      </p>
    </div>
    `,
  );

  return { subject, html };
}

export function subscriptionExpiredEmail({ userName }: ExpiredProps): {
  subject: string;
  html: string;
} {
  const subject = `Your ${appName} Pro subscription has expired`;

  const html = baseTemplate(
    "Your Pro subscription has expired",
    `
    <p style="font-size: 15px; margin-bottom: 20px;">Hi ${userName},</p>

    <p style="font-size: 15px; margin-bottom: 20px;">
      Your <strong>${appName} Pro</strong> subscription has expired and your account
      has been moved to the free plan. Your data is safe — resubscribe anytime to
      get back full access.
    </p>

    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${appUrl}/pricing"
         style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
        Resubscribe to Pro
      </a>
    </div>

    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 13px; color: #6b7280;">
        Questions? Reply to this email and we'll help you out.
      </p>
    </div>
    `,
  );

  return { subject, html };
}
