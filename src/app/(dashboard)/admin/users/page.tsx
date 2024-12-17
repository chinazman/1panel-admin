export const dynamic = 'force-dynamic'

import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/users/data-table"
import { columns } from "@/components/users/columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function UsersPage() {
  const session = await getSession()
  if (session?.role !== "ADMIN") {
    redirect("/")
  }

  const users = await prisma.user.findMany({
    where: {
      role: "USER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">用户管理</h1>
        <Button asChild>
          <Link href="/admin/users/new">新增用户</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  )
} 