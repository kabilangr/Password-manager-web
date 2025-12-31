"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Monitor, Smartphone, Globe, Shield, LogOut } from "lucide-react"

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
        setIsLoading(true)
        try {
            const res = await authClient.listSessions()
            if (res.data) {
                setSessions(res.data as unknown as Session[])
            }
        } catch (e: unknown) {
            console.error(e)
            toast.error("Failed to load sessions")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSessions()
    }, [])

    const handleRevoke = async (sessionId: string, deviceName: string) => {
        if (!window.confirm(`Are you sure you want to revoke the session on ${deviceName}? You will be logged out on that device.`)) {
            return
        }

        try {
            const res = await authClient.revokeSession({ token: sessionId })

            if (res.error) {
                toast.error(res.error.message || "Failed to revoke session")
                return
            }

            setSessions(prev => prev.filter(s => s.id !== sessionId))
            toast.success("Session revoked successfully")
        } catch (e) {
            console.error(e)
            toast.error("An unexpected error occurred")
        }
    }

    const getDeviceIcon = (userAgent: string = "") => {
        const ua = userAgent.toLowerCase()
        if (ua.includes("mobi") || ua.includes("android") || ua.includes("iphone")) return <Smartphone className="h-5 w-5" />
        return <Monitor className="h-5 w-5" />
    }

    const formatUA = (userAgent: string = "") => {
        if (!userAgent) return "Unknown Device"

        if (userAgent.includes("Chrome")) {
            if (userAgent.includes("Edg")) return "Microsoft Edge"
            return "Google Chrome"
        }
        if (userAgent.includes("Firefox")) return "Mozilla Firefox"
        if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Apple Safari"

        return userAgent.split(" ").slice(0, 2).join(" ") || "Unknown Device"
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>Loading your active sessions...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>Active Sessions</CardTitle>
                </div>
                <CardDescription>
                    Manage devices where you are currently logged in.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {sessions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Globe className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>No active sessions found.</p>
                    </div>
                )}

                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-xl bg-card hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    {getDeviceIcon(session.userAgent)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold">
                                            {formatUA(session.userAgent)}
                                        </p>
                                        {session.isCurrent && (
                                            <span className="text-[10px] uppercase font-bold bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                        <span>{session.ipAddress || "Unknown IP"}</span>
                                        <span>•</span>
                                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {!session.isCurrent && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRevoke(session.id, formatUA(session.userAgent))}
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-9 w-9 p-0"
                                    title="Revoke session"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
