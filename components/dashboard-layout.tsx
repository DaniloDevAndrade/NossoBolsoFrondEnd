import type React from "react"
import { Sidebar } from "./sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-20 p-4 sm:p-6 lg:p-8 max-w-full">{children}</main>
    </div>
  )
}
