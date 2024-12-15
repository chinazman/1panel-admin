import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/hosts/data-table"
import { columns } from "@/components/hosts/columns"

export default async function HomePage() {
  const session = await getSession()
  
  const hosts = await prisma.host.findMany({
    where: {
      users: {
        some: {
          userId: session?.id
        }
      }
    },
    select: {
      id: true,
      name: true,
      address: true,
      port: true,
      username: true,
    }
  })

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">主机列表</h1>
      <DataTable columns={columns} data={hosts} />
    </div>
  )
} 