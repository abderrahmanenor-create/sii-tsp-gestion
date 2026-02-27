"use client"

import { SessionProvider } from "next-auth/react"
import { PWARegister } from "@/components/pwa-register"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PWARegister />
      {children}
      <Toaster />
    </SessionProvider>
  )
}
