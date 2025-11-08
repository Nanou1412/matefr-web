"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, Building2, MessageCircle, Home, User } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/logement", label: "Logement", icon: Building2 },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/profil", label: "Profil", icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-50",
        "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      )}
      role="navigation"
      aria-label="Navigation mobile"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 text-xs",
                  "text-muted-foreground hover:text-foreground",
                  active && "text-primary"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="mt-1">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      {/* Safe area iOS */}
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
