import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Nexora <onboarding@resend.dev>";

/**
 * Send vendor approval email
 */
export async function sendVendorApprovedEmail(email: string, storeName: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🎉 Your store "${storeName}" has been approved!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f172a; color: #e2e8f0; border-radius: 12px;">
          <h1 style="color: #60a5fa; margin-bottom: 8px;">Welcome to Nexora!</h1>
          <p style="color: #94a3b8; margin-bottom: 24px;">Your vendor application has been reviewed and approved.</p>
          
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 18px; color: #f1f5f9;">${storeName}</h2>
            <span style="display: inline-block; background: #065f46; color: #6ee7b7; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">APPROVED</span>
          </div>

          <p style="color: #94a3b8; margin-bottom: 16px;">You can now:</p>
          <ul style="color: #cbd5e1; line-height: 1.8;">
            <li>Add products to your store</li>
            <li>Connect your Stripe account to receive payments</li>
            <li>Manage orders from customers</li>
          </ul>

          <a href="${process.env.NEXTAUTH_URL}/vendor" style="display: inline-block; margin-top: 24px; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Go to Vendor Dashboard →
          </a>

          <p style="color: #64748b; font-size: 12px; margin-top: 32px;">
            — The Nexora Team
          </p>
        </div>
      `,
    });
    console.log(`Approval email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send approval email:", error);
  }
}

/**
 * Send vendor suspension/rejection email
 */
export async function sendVendorSuspendedEmail(email: string, storeName: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your store "${storeName}" has been suspended`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f172a; color: #e2e8f0; border-radius: 12px;">
          <h1 style="color: #f87171; margin-bottom: 8px;">Store Suspended</h1>
          <p style="color: #94a3b8; margin-bottom: 24px;">Your vendor store has been suspended by the platform administrator.</p>
          
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 18px; color: #f1f5f9;">${storeName}</h2>
            <span style="display: inline-block; background: #7f1d1d; color: #fca5a5; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">SUSPENDED</span>
          </div>

          <p style="color: #94a3b8; margin-bottom: 16px;">
            While suspended, your store and products will not be visible to customers. 
            If you believe this is an error, please contact our support team.
          </p>

          <p style="color: #64748b; font-size: 12px; margin-top: 32px;">
            — The Nexora Team
          </p>
        </div>
      `,
    });
    console.log(`Suspension email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send suspension email:", error);
  }
}
