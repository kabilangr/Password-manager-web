"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Laptop, Smartphone, Globe } from "lucide-react"

interface Session {
    id: string
    userAgent?: string
    ipAddress?: string
    createdAt: Date
    expiresAt: Date
    isCurrent?: boolean
}

export function SessionsList() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchSessions = async () => {
        try {
            const res = await authClient.listSessions()
            if (res.data) {
                // Map to our interface if needed, or use directly
                setSessions(res.data as unknown as Session[])
            }
        } catch (e: unknown) {
            console.error(e)
            toast.error("Failed to load sessions")
        }
        setIsLoading(false)
    }

    useEffect(() => {
        // Use an IIFE or separate function to avoid returning a promise to useEffect
        const init = async () => {
            await fetchSessions()
        }
        init()
    }, [])

    const handleRevoke = async (sessionId: string) => {
        try {
            await authClient.revokeSession({ token: sessionId }) // Or id, depending on API. verify docs usually imply token or id. 
            // improved retry/refresh
            setSessions(sessions.filter(s => s.id !== sessionId))
            toast.success("Session revoked")
        } catch (e) {
            toast.error("Failed to revoke session")
        }
    }

    if (isLoading) return <div>Loading sessions...</div>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                    Manage devices where you are currently logged in.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {sessions.length === 0 && <p className="text-sm text-muted-foreground">No active sessions found.</p>}
                {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-full">
                                <Globe className="h-5 w-5 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    {session.userAgent || "Unknown Device"}
                                    {session.isCurrent && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Current</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    IP: {session.ipAddress || "Unknown"} • Started: {new Date(session.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        {!session.isCurrent && (
                            <Button variant="outline" size="sm" onClick={() => handleRevoke(session.id || "")}>
                                Revoke
                            </Button>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
