export const dynamic = 'force-dynamic'

import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/users/data-table"
import { columns } from "@/components/users/columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const ITEMS_PER_PAGE = 10

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UsersPage({ searchParams }: Props) {
  const session = await getSession()
  if (session?.role !== "ADMIN") {
    redirect("/")
  }

  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : ''
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const skip = (page - 1) * ITEMS_PER_PAGE

  const where = {
    role: "USER",
    OR: [
      { name: { contains: q } },
      { email: { contains: q } },
    ],
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      skip,
      take: ITEMS_PER_PAGE,
    }),
  ])

  const pageCount = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">用户管理</h1>
        <Button asChild>
          <Link href="/admin/users/new">新增用户</Link>
        </Button>
      </div>
      <DataTable 
        columns={columns} 
        data={users} 
        pageCount={pageCount}
        currentPage={page}
      />
    </div>
  )
} 