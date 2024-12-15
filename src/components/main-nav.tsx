"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession } from "@/hooks/use-session"

const navItems = [
  {
    href: "/",
    label: "主机列表",
  },
  {
    href: "/my-hosts",
    label: "我的主机",
  },
  {
    href: "/admin/hosts",
    label: "主机管理",
    admin: true,
  },
  {
    href: "/admin/users",
    label: "用户管理",
    admin: true,
  },
]

export function MainNav() {
  const pathname = usePathname()
  const session = useSession()

  return (
    <nav className="flex items-center space-x-4">
      {navItems.map((item) => {
        if (item.admin && session?.role !== "ADMIN") {
          return null
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
} 