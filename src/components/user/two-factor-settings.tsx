"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { QRCode } from "react-qrcode-logo"

export function TwoFactorSettings() {
    const [isEnabled, setIsEnabled] = useState(false) // Ideally fetch from session
    const [qrURI, setQrURI] = useState<string | null>(null)
    const [totpCode, setTotpCode] = useState("")
    const [backupCodes, setBackupCodes] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState<"initial" | "verify" | "enabled">("initial")

    const session = authClient.useSession()

    // Check if 2FA is already enabled in session (if supported by client hook)
    // const is2FA = session.data?.user.twoFactorEnabled

    const handleEnableClick = async () => {
        setIsLoading(true)
        try {
            const res = await authClient.twoFactor.enable({
                password: prompt("Please confirm your password to enable 2FA:") || ""
            })

            if (res.data) {
                setQrURI(res.data.totpURI)
                setBackupCodes(res.data.backupCodes || [])
                setStep("verify")
            } else if (res.error) {
                toast.error(res.error.message)
            }
        } catch (e: unknown) {
            const error = e as Error
            toast.error(error.message)
        }
        setIsLoading(false)
    }

    const handleVerify = async () => {
        setIsLoading(true)
        try {
            const res = await authClient.twoFactor.verifyTotp({
                code: totpCode
            })

            if (res.data) {
                toast.success("2FA Enabled Successfully!")
                setStep("enabled")
                setQrURI(null) // Clear sensitive QR
            } else {
                toast.error("Invalid Code")
            }
        } catch (e: unknown) {
            const error = e as Error
            toast.error(error.message)
        }
        setIsLoading(false)
    }

    const handleDisable = async () => {
        if (!confirm("Are you sure you want to disable 2FA?")) return
        setIsLoading(true)
        try {
            const res = await authClient.twoFactor.disable({
                password: prompt("Confirm password:") || ""
            })
            if (res.data) {
                toast.success("2FA Disabled")
                setStep("initial")
            }
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to disable 2FA")
        }
        setIsLoading(false)
    }

    if (session.isPending) return <div>Loading...</div>

    // If session says it's enabled, we show disable UI
    // Note: BetterAuth session object needs to expose 'twoFactorEnabled' 
    // If not, we rely on local state or API check.
    const user = session.data?.user
    const is2FAEnabled = user?.twoFactorEnabled || step === "enabled"

    return (
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                    Protect your account with an extra layer of security.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {is2FAEnabled ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
                            ✓ 2FA is currently <strong>ENABLED</strong>
                        </div>
                        <Button variant="destructive" onClick={handleDisable} disabled={isLoading}>
                            Disable 2FA
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {step === "initial" && (
                            <Button onClick={handleEnableClick} disabled={isLoading}>
                                Set up 2FA
                            </Button>
                        )}

                        {step === "verify" && qrURI && (
                            <div className="space-y-4">
                                <div className="flex justify-center border p-4 rounded bg-white">
                                    <QRCode value={qrURI} />
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                                </p>
                                <div className="space-y-2">
                                    <Label>Enter Code</Label>
                                    <Input
                                        value={totpCode}
                                        onChange={(e) => setTotpCode(e.target.value)}
                                        placeholder="123456"
                                        maxLength={6}
                                    />
                                    <Button onClick={handleVerify} className="w-full" disabled={isLoading}>
                                        Verify & Enable
                                    </Button>
                                </div>
                                {backupCodes.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-bold text-sm">Backup Codes (Save these!):</p>
                                        <pre className="text-xs bg-slate-100 p-2 rounded mt-1">
                                            {backupCodes.join("\n")}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
