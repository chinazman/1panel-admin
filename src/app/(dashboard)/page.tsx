import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  // 根据用户角色重定向到对应页面
  if (session.role === "ADMIN") {
    redirect("/admin/hosts")  // 管理员重定向到主机管理页面
  } else {
    redirect("/my-hosts")     // 普通用户重定向到我的主机页面
  }
} 