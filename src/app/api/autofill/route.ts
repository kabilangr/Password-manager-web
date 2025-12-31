import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { secrets, vaults } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// This endpoint is intended to be called by the browser extension.
// It requires an authenticated session (or an API key in a real extension scenario).
// For now, we assume the extension shares the session cookie (if same-site) or uses a token.

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const domain = searchParams.get("domain")

    if (!domain) {
        return NextResponse.json({ error: "Domain required" }, { status: 400 })
    }

    // In a real implementation, we would need to decrypt the secrets to check the domain (URL),
    // OR, better, store a hashed/blind-index of the domain to allow server-side filtering without revealing the domain.
    // Since we are pure ZK, the server sees "encryptedData".
    // WE CANNOT filter by domain on the server unless we store a "domainHash" or similar.

    // For this MVP, we will return ALL secrets for brevity (or secrets for a specific vault)
    // and let the Client (Extension) decrypt and filter.
    // This is inefficient for large vaults but preserves ZK if we didn't implement blind indexing.

    // However, if we assume the user has a "Personal" vault:
    try {
        const mySecrets = await db.select({
            id: secrets.id,
            encryptedData: secrets.encryptedData,
            iv: secrets.iv
        })
            .from(secrets)
            .innerJoin(vaults, eq(secrets.vaultId, vaults.id))
            .where(eq(vaults.ownerId, session.user.id))

        return NextResponse.json({ success: true, data: { secrets: mySecrets } })
    } catch (error: unknown) {
        console.error("Autofill API Error:", error)
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : "Internal Server Error"
            }
        }, { status: 500 })
    }
}
