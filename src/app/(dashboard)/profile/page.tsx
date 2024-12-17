export const dynamic = 'force-dynamic'

import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "@/components/profile/profile-form"
import { Separator } from "@/components/ui/separator"

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">个人信息</h3>
        <p className="text-sm text-muted-foreground">
          更新您的个人信息和密码
        </p>
      </div>
      <Separator />
      <ProfileForm user={user} />
    </div>
  )
} 