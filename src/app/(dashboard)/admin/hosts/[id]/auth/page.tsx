import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { HostAuthForm } from "@/components/hosts/host-auth-form"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export default async function HostAuthPage({ params }: Props) {
  const session = await getSession()
  if (session?.role !== "ADMIN") {
    redirect("/")
  }

  const id = (await params).id

  const [host, users] = await Promise.all([
    prisma.host.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            userId: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
  ])

  if (!host) {
    notFound()
  }

  const authorizedUserIds = host.users.map((u) => u.userId)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">主机授权 - {host.name}</h1>
      <HostAuthForm
        hostId={host.id}
        users={users}
        authorizedUserIds={authorizedUserIds}
      />
    </div>
  )
} 