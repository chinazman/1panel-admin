export const dynamic = 'force-dynamic'

import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/my-hosts/data-table"
import { columns } from "@/components/my-hosts/columns"

const ITEMS_PER_PAGE = 10

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function MyHostsPage({ searchParams }: Props) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : ''
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const skip = (page - 1) * ITEMS_PER_PAGE

  const where = {
    users: {
      some: {
        userId: session.id,
      },
    },
    OR: [
      { name: { contains: q } },
      { code: { contains: q } },
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
      },
      skip,
      take: ITEMS_PER_PAGE,
    }),
  ])

  const pageCount = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">我的主机</h3>
        <p className="text-sm text-muted-foreground">
          查看您有权限访问的主机列表
        </p>
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