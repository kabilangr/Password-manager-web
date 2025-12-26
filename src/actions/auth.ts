"use server"

import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { ActionResponse } from "@/interface/AppError"

export async function registerUser(payload: {
    name: string
    email: string
    password: string
    salt: string
    encryptedPrivateKey: string
    publicKey: string
}): Promise<ActionResponse<{ userId: string }>> {
    try {
        const user = await auth.api.signUpEmail({
            body: {
                email: payload.email,
                password: payload.password,
                name: payload.name,
            },
            headers: await headers()
        })

        if (!user) {
            return {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: "Failed to create user account" }
            }
        }

        await db.update(users).set({
            salt: payload.salt,
            encryptedPrivateKey: payload.encryptedPrivateKey,
            publicKey: payload.publicKey
        }).where(eq(users.id, user.user.id))

        return { success: true, data: { userId: user.user.id } }
    } catch (error: unknown) {
        console.error("Registration error:", error)
        let message = "Registration failed"
        let code: any = 'INTERNAL_ERROR'

        if (error instanceof Error) {
            // @ts-expect-error - BetterAuth errors might have a body
            message = error.body?.message || error.message
            // @ts-expect-error - BetterAuth errors might have a code
            if (error.code === 'USER_ALREADY_EXISTS') code = 'VALIDATION_ERROR'
        }

        return {
            success: false,
            error: { code: code as any || 'INTERNAL_ERROR', message }
        }
    }
}
