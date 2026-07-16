import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "Wescues <onboarding@resend.dev>";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://wescues.com";

export async function sendApplicationConfirmation({
  to,
  dogName,
  shelterName,
  applicationId,
}: {
  to: string;
  dogName: string;
  shelterName: string;
  applicationId: string;
}) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Your application for ${dogName} is in! 🐾`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #2d2d2d;">
          <p style="font-size: 32px; margin: 0 0 8px;">🐾</p>
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 16px;">Application submitted!</h1>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px;">
            Great news — your application to adopt <strong>${dogName}</strong> from <strong>${shelterName}</strong> has been received.
          </p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px; opacity: 0.7;">
            The shelter will review your application and reach out to schedule a meet-and-greet. This typically takes 2–5 business days.
          </p>
          <a href="${BASE_URL}/dashboard/applications"
             style="display: inline-block; background: #2d7d4e; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 15px;">
            View Your Application →
          </a>
          <p style="font-size: 13px; opacity: 0.5; margin: 32px 0 0;">
            Wescues · Every dog deserves a home
          </p>
        </div>
      `,
    });
  } catch (err) {
    // Email failures are non-fatal — log but don't throw
    console.error("Failed to send application confirmation email:", err);
  }
}

export async function sendNewApplicationEmail({
  to,
  dogName,
  applicantEmail,
  applicationId,
}: {
  to: string;
  dogName: string;
  applicantEmail: string;
  applicationId: string;
}) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `New application for ${dogName}! 🐾`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #2d2d2d;">
          <p style="font-size: 32px; margin: 0 0 8px;">📬</p>
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 16px;">New adoption application!</h1>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px;">
            Someone has applied to adopt <strong>${dogName}</strong>.
          </p>
          <div style="background: #f5f5f0; border-left: 3px solid #2d7d4e; padding: 12px 16px; margin: 0 0 24px;">
            <p style="font-size: 13px; font-weight: bold; margin: 0 0 4px; opacity: 0.6;">APPLICANT</p>
            <p style="font-size: 15px; margin: 0;">${applicantEmail}</p>
          </div>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px; opacity: 0.7;">
            Log in to your shelter dashboard to review the application and take action.
          </p>
          <a href="${BASE_URL}/shelter/applications"
             style="display: inline-block; background: #2d7d4e; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 15px;">
            Review Application →
          </a>
          <p style="font-size: 13px; opacity: 0.5; margin: 32px 0 0;">
            Wescues · Every dog deserves a home · Application ID: ${applicationId}
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send new application email to shelter:", err);
  }
}

export async function sendStatusUpdateEmail({
  to,
  dogName,
  newStatus,
  shelterNote,
}: {
  to: string;
  dogName: string;
  newStatus: string;
  shelterNote?: string | null;
}) {
  const STATUS_COPY: Record<string, { subject: string; headline: string; body: string }> = {
    reviewing: {
      subject: `Update on your ${dogName} application 🔍`,
      headline: "Your application is under review",
      body: `The shelter is actively reviewing your application for <strong>${dogName}</strong>. They may reach out with questions soon.`,
    },
    approved: {
      subject: `Great news about ${dogName}! 🎉`,
      headline: "You've been approved!",
      body: `Congratulations — your application for <strong>${dogName}</strong> has been approved! The shelter will be in touch to arrange next steps.`,
    },
    more_info: {
      subject: `The shelter needs more info about your ${dogName} application ✏️`,
      headline: "More information needed",
      body: `The shelter reviewing your application for <strong>${dogName}</strong> would like a bit more information before moving forward.`,
    },
    declined: {
      subject: `Update on your ${dogName} application`,
      headline: "Application update",
      body: `Thank you for your interest in adopting <strong>${dogName}</strong>. Unfortunately, the shelter has decided to move forward with another applicant at this time. Don't give up — there are many dogs waiting for their perfect home.`,
    },
  };

  const copy = STATUS_COPY[newStatus];
  if (!copy) return;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: copy.subject,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #2d2d2d;">
          <h1 style="font-size: 22px; font-weight: bold; margin: 0 0 16px;">${copy.headline}</h1>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">${copy.body}</p>
          ${shelterNote ? `
            <div style="background: #f5f5f0; border-left: 3px solid #2d7d4e; padding: 12px 16px; margin: 0 0 24px;">
              <p style="font-size: 13px; font-weight: bold; margin: 0 0 4px; opacity: 0.6;">NOTE FROM SHELTER</p>
              <p style="font-size: 15px; margin: 0;">${shelterNote}</p>
            </div>
          ` : ""}
          <a href="${BASE_URL}/dashboard/applications"
             style="display: inline-block; background: #2d7d4e; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 15px;">
            View Application →
          </a>
          <p style="font-size: 13px; opacity: 0.5; margin: 32px 0 0;">Wescues · Every dog deserves a home</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send status update email:", err);
  }
}
