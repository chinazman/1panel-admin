import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserForm } from "@/components/users/user-form"

export default async function NewUserPage() {
  const session = await getSession()
  if (session?.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">新增用户</h1>
      <UserForm />
    </div>
  )
} 