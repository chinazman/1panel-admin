"use client"

import { useEffect, useState } from "react"
import { User } from "@/lib/types"

export function useSession() {
  const [session, setSession] = useState<Pick<User, "id" | "email" | "name" | "role"> | null>(null)

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setSession(data))
      .catch(console.error)
  }, [])

  return session
} 