"use server"

import { auth } from "@/lib/auth"
import { db } from "@/db"
import { vaults, secrets, members } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { logAudit } from "@/lib/audit"
import { ActionResponse } from "@/interface/AppError"

// --- Vaults ---

export async function createVault(name: string, organizationId?: string): Promise<ActionResponse<{ vaultId: string }>> {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) return { success: false, error: { code: 'AUTH_UNAUTHORIZED', message: "Authentication required" } }

    try {
        let finalOwnerId: string | null = session.user.id
        let finalOrgId: string | null = null

        if (organizationId) {
            // Verify membership
            const membership = await db.query.members.findFirst({
                where: and(
                    eq(members.organizationId, organizationId),
                    eq(members.userId, session.user.id)
                )
            })

            if (!membership) {
                return { success: false, error: { code: 'AUTH_UNAUTHORIZED', message: "Not a member of this organization" } }
            }
            finalOwnerId = null // Org vaults don't have a single owner user
            finalOrgId = organizationId
        }

        const vaultId = uuidv4()
        await db.insert(vaults).values({
            id: vaultId,
            name,
            ownerId: finalOwnerId,
            organizationId: finalOrgId
        })

        await logAudit({
            userId: session.user.id,
            action: "VAULT_CREATE",
            resourceId: vaultId
        })

        revalidatePath("/dashboard")
        return { success: true, data: { vaultId: vaultId } }
    } catch (error) {
        console.error("Create vault error:", error)
        return { success: false, error: { code: 'DB_ERROR', message: "Failed to create vault" } }
    }
}

export async function getVaults() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) return []

    // Get personal vaults
    return await db.select().from(vaults).where(eq(vaults.ownerId, session.user.id))
}

export async function getVault(id: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) return null

    const [vault] = await db.select().from(vaults).where(
        and(
            eq(vaults.id, id),
            eq(vaults.ownerId, session.user.id)
        )
    )

    if (vault) {
        await logAudit({
            userId: session.user.id,
            action: "VAULT_ACCESS",
            resourceId: id
        })
    }

    return vault
}

// --- Secrets ---

export async function createSecret(vaultId: string, encryptedData: string, iv: string): Promise<ActionResponse<{ secretId: string }>> {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) return { success: false, error: { code: 'AUTH_UNAUTHORIZED', message: "Authentication required" } }

    // Verify vault ownership
    const [vault] = await db.select().from(vaults).where(
        and(
            eq(vaults.id, vaultId),
            eq(vaults.ownerId, session.user.id)
        )
    )
    if (!vault) return { success: false, error: { code: 'VAULT_NOT_FOUND', message: "Vault not found" } }

    try {
        const secretId = uuidv4()
        await db.insert(secrets).values({
            id: secretId,
            vaultId,
            encryptedData,
            iv
        })

        await logAudit({
            userId: session.user.id,
            action: "SECRET_CREATE",
            resourceId: secretId
        })

        revalidatePath(`/dashboard/vaults/${vaultId}`)
        return { success: true, data: { secretId } }
    } catch (error) {
        console.error("Create secret error:", error)
        return { success: false, error: { code: 'DB_ERROR', message: "Failed to store secret" } }
    }
}

export async function getSecrets(vaultId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) return []

    // Verify ownership (or membership)
    const [vault] = await db.select().from(vaults).where(
        and(
            eq(vaults.id, vaultId),
            eq(vaults.ownerId, session.user.id)
        )
    )
    if (!vault) return []

    // Note: Logging "SECRET_ACCESS" for getting the list might be noisy, 
    // but useful for strict auditing.
    await logAudit({
        userId: session.user.id,
        action: "SECRETS_LIST_ACCESS",
        resourceId: vaultId
    })

    return await db.select().from(secrets).where(eq(secrets.vaultId, vaultId))
}
