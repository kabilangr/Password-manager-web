import { db } from "@/db"
import { auditLogs } from "@/db/schema"
import { headers } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export async function logAudit({ userId, action, resourceId }: { userId: string, action: string, resourceId?: string }) {
    try {
        const headersList = await headers()
        const ip = headersList.get("x-forwarded-for") || "unknown"
        const userAgent = headersList.get("user-agent") || "unknown"

        await db.insert(auditLogs).values({
            id: uuidv4(),
            userId,
            action,
            resourceId,
            ipAddress: ip,
            userAgent,
            timestamp: new Date()
        })
    } catch (error) {
        console.error("Failed to write audit log:", error)
        // Fail silent? Or throw? For security apps, audit failure should potentially block action.
        // But for MVP we log error.
    }
}
