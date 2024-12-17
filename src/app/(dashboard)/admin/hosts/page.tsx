export const dynamic = 'force-dynamic'

import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/hosts/admin-data-table"
import { columns } from "@/components/hosts/admin-columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const ITEMS_PER_PAGE = 10

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HostsPage({ searchParams }: Props) {
  const session = await getSession()
  if (session?.role !== "ADMIN") {
    redirect("/")
  }

  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : ''
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const skip = (page - 1) * ITEMS_PER_PAGE

  const where = {
    OR: [
      { name: { contains: q } },
      { code: { contains: q } },
      { url: { contains: q } },
    ],
  }

  const [total, hosts] = await Promise.all([
    prisma.host.count({ where }),
    prisma.host.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        url: true,
        entranceCode: true,
        username: true,
      },
      skip,
      take: ITEMS_PER_PAGE,
    }),
  ])

  const pageCount = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">主机管理</h1>
        <Button asChild>
          <Link href="/admin/hosts/new">新增主机</Link>
        </Button>
      </div>
      <DataTable 
        columns={columns} 
        data={hosts} 
        pageCount={pageCount}
        currentPage={page}
      />
    </div>
  )
} 