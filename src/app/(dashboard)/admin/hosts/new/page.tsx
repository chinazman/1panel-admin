export const dynamic = 'force-dynamic'

import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { HostForm } from "@/components/hosts/host-form"

export default async function NewHostPage() {
  const session = await getSession()
  if (session?.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">新增主机</h1>
      <HostForm />
    </div>
  )
} 