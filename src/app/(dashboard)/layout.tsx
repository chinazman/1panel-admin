import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-1" />
            <MainNav />
            <div className="flex-1 flex justify-end">
              <UserNav user={session} />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 py-6">
        <div className="container max-w-6xl mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  )
} 