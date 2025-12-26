"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { generateSalt, deriveKey, generateRSAKeyPair, exportKey, encryptData, arrayBufferToBase64 } from "@/lib/crypto"
import { registerUser } from "@/actions/auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PasswordInput } from "@/components/ui/password-input"
import { UI_VALUES } from "@/values/constants"

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            toast.info("Generating security keys...")
            // 1. Generate Salt
            const salt = generateSalt()
            const saltBase64 = arrayBufferToBase64(salt as unknown as ArrayBuffer)

            // 2. Derive Key from Password + Salt
            const masterKey = await deriveKey(password, salt)

            // 3. Generate RSA Key Pair
            const keyPair = await generateRSAKeyPair()
            const publicKeyBase64 = await exportKey(keyPair.publicKey)

            // 4. Encrypt Private Key with Derived Master Key
            // We export it first (as pkcs8), then encrypt that string/buffer
            const privateKeyBase64 = await exportKey(keyPair.privateKey)
            const { encrypted: encryptedPrivateKey, iv: ivPrivateKey } = await encryptData(masterKey, privateKeyBase64)

            // Serialize encrypted private key + IV
            const encryptedPrivateKeyPkg = JSON.stringify({
                data: arrayBufferToBase64(encryptedPrivateKey as unknown as ArrayBuffer),
                iv: arrayBufferToBase64(ivPrivateKey as unknown as ArrayBuffer)
            })

            // 5. Register via Server Action
            const result = await registerUser({
                name,
                email,
                password,
                salt: saltBase64,
                encryptedPrivateKey: encryptedPrivateKeyPkg,
                publicKey: publicKeyBase64
            })

            if (!result.success) {
                toast.error(result.error.message)
                setIsLoading(false)
                return
            }

            // 6. Sign In automatically to establish session
            await authClient.signIn.email({
                email,
                password
            })

            toast.success("Account created successfully!")
            router.push("/dashboard")

        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : "An unexpected error occurred"
            toast.error("Error: " + message)
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                    Start securing your passwords with Zero-Knowledge encryption.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Master Password</Label>
                        <PasswordInput id="password" name="password" required minLength={UI_VALUES.MIN_PASSWORD_LENGTH} />
                        <p className="text-xs text-muted-foreground">
                            This password encrypts your vault. We cannot recover it.
                        </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
                </p>
            </CardFooter>
        </Card>
    )
}
