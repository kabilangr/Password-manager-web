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
            async sendInvitationEmail() {
                // TODO: Implement email sending
            },
        }),
        twoFactor(),
    ],
    // Enterprise features like multi-session are handled by BetterAuth core session management,
    // but we ensure we support strict session handling.
});
