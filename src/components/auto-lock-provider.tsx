"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AutoLockContextType {
    isLocked: boolean
    resetTimer: () => void
}

const AutoLockContext = createContext<AutoLockContextType>({
    isLocked: false,
    resetTimer: () => { },
})

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 Minutes

export function AutoLockProvider({ children }: { children: React.ReactNode }) {
    const [isLocked, setIsLocked] = useState(false)
    const router = useRouter()
    const timerRef = React.useRef<NodeJS.Timeout | null>(null)

    const lock = React.useCallback(() => {
        setIsLocked(true)
        // Ideally we would wipe any MasterKey from React Context here
        // For now, we force a redirect to login
        router.push("/login")
        toast.warning("Vault locked due to inactivity.")
    }, [router])

    const resetTimer = React.useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(lock, IDLE_TIMEOUT_MS)
    }, [lock])

    useEffect(() => {
        // Events to detect activity
        const events = ["mousedown", "keydown", "scroll", "touchstart"]

        const handleActivity = () => {
            if (!isLocked) resetTimer()
        }

        events.forEach(event => window.addEventListener(event, handleActivity))

        resetTimer() // Start timer

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            events.forEach(event => window.removeEventListener(event, handleActivity))
        }
    }, [isLocked, resetTimer])

    return (
        <AutoLockContext.Provider value={{ isLocked, resetTimer }}>
            {children}
        </AutoLockContext.Provider>
    )
}

export const useAutoLock = () => useContext(AutoLockContext)
