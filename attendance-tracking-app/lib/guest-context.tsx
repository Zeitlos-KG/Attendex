"use client"

/**
 * guest-context.tsx
 * Lightweight React context that exposes isGuest and exitGuestMode globally.
 * Guest state is persisted in the `guest_mode` cookie (set by /api/guest).
 * Initialized synchronously so pages never see a false isGuest on first render.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

function readGuestCookie(): boolean {
    if (typeof document === 'undefined') return false
    return document.cookie.split(';').some(c => c.trim().startsWith('guest_mode=1'))
}

interface GuestContextValue {
    isGuest: boolean
    exitGuestMode: () => Promise<void>
}

const GuestContext = createContext<GuestContextValue>({
    isGuest: false,
    exitGuestMode: async () => { },
})

export function GuestProvider({ children }: { children: ReactNode }) {
    // Lazy initializer reads cookie synchronously — no useEffect delay that would
    // cause a flash where isGuest=false and pages fire real API calls.
    const [isGuest, setIsGuest] = useState<boolean>(() => readGuestCookie())
    const router = useRouter()

    const exitGuestMode = useCallback(async () => {
        await fetch('/api/guest', { method: 'DELETE' })
        setIsGuest(false)
        router.push('/')
    }, [router])

    return (
        <GuestContext.Provider value={{ isGuest, exitGuestMode }}>
            {children}
        </GuestContext.Provider>
    )
}

export function useGuestMode() {
    return useContext(GuestContext)
}
