import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { organization, twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "mysql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        organization({
            async sendInvitationEmail(data) {
                // STUB: Integration point for email service (e.g., Resend, SendGrid)
                if (process.env.NODE_ENV === "development") {
                    console.log(`[DEV] Email Stub: Inviting ${data.email} to ${data.organization.name} by ${data.inviter.user.name}`);
                }
            },
        }),
        twoFactor(),
    ],
    // Enterprise features like multi-session are handled by BetterAuth core session management,
    // but we ensure we support strict session handling.
});
