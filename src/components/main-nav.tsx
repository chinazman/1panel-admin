"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession } from "@/hooks/use-session"

// 管理员菜单项
const adminNavItems = [
  {
    href: "/admin/hosts",
    label: "主机管理",
  },
  {
    href: "/admin/users",
    label: "用户管理",
  },
]

// 普通用户菜单项
const userNavItems = [
  {
    href: "/",
    label: "主机列表",
  },
  {
    href: "/my-hosts",
    label: "我的主机",
  },
]

export function MainNav() {
  const pathname = usePathname()
  const session = useSession()

  // 根据用户角色选择显示的菜单项
  const navItems = session?.role === "ADMIN" ? adminNavItems : userNavItems

  return (
    <nav className="flex items-center space-x-4">
      {navItems.map((item) => (
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
      ))}
    </nav>
  )
} 