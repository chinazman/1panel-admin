"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface User {
  id: string
  name: string
  email: string
}

interface HostAuthFormProps {
  hostId: string
  users: User[]
  authorizedUserIds: string[]
}

export function HostAuthForm({ hostId, users, authorizedUserIds }: HostAuthFormProps) {
  const router = useRouter()
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(
    new Set(authorizedUserIds)
  )
  const [isLoading, setIsLoading] = useState(false)

  function toggleUser(userId: string) {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  async function onSubmit() {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/hosts/${hostId}/auth`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: Array.from(selectedUsers),
        }),
      })

      if (!response.ok) {
        throw new Error("更新授权失败")
      }

      router.push("/admin/hosts")
      router.refresh()
    } catch (error) {
      console.error("更新授权失败:", error)
      alert("更新授权失败")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={() => toggleUser(user.id)}
                  />
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          取消
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  )
} 