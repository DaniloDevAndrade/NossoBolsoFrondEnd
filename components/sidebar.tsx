"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Receipt,
  Handshake,
  MessageSquare,
  Users,
  User,
  Menu,
  X,
  CreditCard,
  Target,
  UserCircle,
} from "lucide-react"
import { useState } from "react"
import Image from "next/image"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Receipt, label: "Transações", href: "/dashboard/transacoes" },
  { icon: UserCircle, label: "Meus Dados", href: "/dashboard/individual" },
  { icon: CreditCard, label: "Cartões", href: "/dashboard/cartoes" },
  { icon: Target, label: "Metas", href: "/dashboard/metas" },
  // { icon: MessageSquare, label: "Chatbot", href: "/chatbot" },
  { icon: Users, label: "Configurações", href: "/dashboard/configuracoes" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden w-12 h-12 bg-card border border-border/20 rounded-xl flex items-center justify-center text-foreground shadow-lg"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-20 bg-card/80 backdrop-blur-xl border-r border-border/20 flex flex-col items-center py-8 gap-6 z-40 transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Link href="/dashboard" className="mb-4 flex-shrink-0" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center">
            <Image src="/logo.png" alt="NossoBolso" width={56} height={56} className="object-contain" />
          </div>
        </Link>

        <nav className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4 scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
