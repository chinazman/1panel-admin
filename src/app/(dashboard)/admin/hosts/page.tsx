import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/hosts/admin-data-table"
import { columns } from "@/components/hosts/admin-columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function HostsPage() {
  const session = await getSession()
  if (session?.role !== "ADMIN") {
    redirect("/")
  }

  const hosts = await prisma.host.findMany({
    select: {
      id: true,
      name: true,
      url: true,
      entranceCode: true,
      username: true,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">主机管理</h1>
        <Button asChild>
          <Link href="/admin/hosts/new">新增主机</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={hosts} />
    </div>
  )
} 