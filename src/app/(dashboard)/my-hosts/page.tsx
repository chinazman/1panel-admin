import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/my-hosts/data-table"
import { columns } from "@/components/my-hosts/columns"

type Host = {
  id: string
  name: string
  code: string
}

export default async function MyHostsPage() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const hosts: Host[] = await prisma.host.findMany({
    where: {
      users: {
        some: {
          userId: session.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">我的主机</h3>
        <p className="text-sm text-muted-foreground">
          查看您有权限访问的主机列表
        </p>
      </div>
      <DataTable columns={columns} data={hosts} />
    </div>
  )
} 