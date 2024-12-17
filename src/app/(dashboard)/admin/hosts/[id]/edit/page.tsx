import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { HostForm } from "@/components/hosts/host-form"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditHostPage({ params }: Props) {
  const session = await getSession()
  if (session?.role !== "ADMIN") {
    redirect("/")
  }

  const id = (await params).id

  const host = await prisma.host.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      code: true,
      url: true,
      entranceCode: true,
      username: true,
    },
  })

  if (!host) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">编辑主机</h1>
      <HostForm host={host} />
    </div>
  )
} 