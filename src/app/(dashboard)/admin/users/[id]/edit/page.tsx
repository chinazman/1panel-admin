import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { UserForm } from "@/components/users/user-form"
import { notFound } from "next/navigation"

interface Props {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: Props) {
  const session = await getSession()
  if (session?.role !== "ADMIN") {
    redirect("/")
  }

  const user = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">编辑用户</h1>
      <UserForm user={{...user, role: "USER"}} />
    </div>
  )
}