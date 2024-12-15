import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { HostForm } from "@/components/hosts/host-form"
import { notFound } from "next/navigation"

interface Props {
  params: {
    id: string
  }
}

export default async function EditHostPage({ params }: Props) {
  const session = await getSession()
  if (session?.role !== "ADMIN") {
    redirect("/")
  }

  const host = await prisma.host.findUnique({
    where: {
      id: params.id,
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