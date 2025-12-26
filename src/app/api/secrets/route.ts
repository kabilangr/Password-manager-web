import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { secrets, vaults } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return NextResponse.json({
                success: false,
                error: { code: 'AUTH_UNAUTHORIZED', message: "Unauthorized" }
            }, { status: 401 })
        }

        const body = await req.json()
        const { encryptedData, iv, vaultId } = body

        if (!encryptedData || !iv || !vaultId) {
            return NextResponse.json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: "Missing required fields" }
            }, { status: 400 })
        }

        // Verify ownership of the vault
        const [vault] = await db.select().from(vaults).where(
            and(
                eq(vaults.id, vaultId),
                eq(vaults.ownerId, session.user.id)
            )
        )

        if (!vault) {
            return NextResponse.json({
                success: false,
                error: { code: 'VAULT_NOT_FOUND', message: "Vault not found or access denied" }
            }, { status: 404 })
        }

        const secretId = uuidv4()
        await db.insert(secrets).values({
            id: secretId,
            vaultId,
            encryptedData,
            iv,
            // createdAt: new Date(), // Drizzle handles defaults if set, or we set here
        })

        return NextResponse.json({ success: true, data: { id: secretId } })
    } catch (error: unknown) {
        console.error("API Secret Creation Error:", error)
        const message = error instanceof Error ? error.message : "Internal error"
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: process.env.NODE_ENV === 'development' ? message : "Failed to create secret"
            }
        }, { status: 500 })
    }
}
