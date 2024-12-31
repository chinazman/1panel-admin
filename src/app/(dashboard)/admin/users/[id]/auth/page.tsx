export const dynamic = 'force-dynamic'

import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { UserAuthForm } from "@/components/users/user-auth-form"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export default async function UserAuthPage({ params }: Props) {
  const session = await getSession()
  if (session?.role !== "ADMIN") {
    redirect("/")
  }

  const id = (await params).id

  const [user, hosts] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        hosts: {
          select: {
            hostId: true,
          },
        },
      },
    }),
    prisma.host.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        url: true,
        entranceCode: true,
        username: true,
      },
    }),
  ])

  if (!user) {
    notFound()
  }

  const authorizedHostIds = user.hosts.map((h) => h.hostId)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">用户授权 - {user.name}</h1>
      <UserAuthForm
        userId={user.id}
        hosts={hosts}
        authorizedHostIds={authorizedHostIds}
      />
    </div>
  )
} 