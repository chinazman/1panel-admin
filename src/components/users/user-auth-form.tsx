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
import { Host } from "@/lib/types"

interface UserAuthFormProps {
  userId: string
  hosts: Host[]
  authorizedHostIds: string[]
}

export function UserAuthForm({ userId, hosts, authorizedHostIds }: UserAuthFormProps) {
  const router = useRouter()
  const [selectedHosts, setSelectedHosts] = useState<Set<string>>(
    new Set(authorizedHostIds)
  )
  const [isLoading, setIsLoading] = useState(false)

  function toggleHost(hostId: string) {
    const newSelected = new Set(selectedHosts)
    if (newSelected.has(hostId)) {
      newSelected.delete(hostId)
    } else {
      newSelected.add(hostId)
    }
    setSelectedHosts(newSelected)
  }

  async function onSubmit() {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${userId}/auth`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hostIds: Array.from(selectedHosts),
        }),
      })

      if (!response.ok) {
        throw new Error("更新授权失败")
      }

      router.push("/admin/users")
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
              <TableHead>主机名称</TableHead>
              <TableHead>主机编码</TableHead>
              <TableHead>地址</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hosts.map((host) => (
              <TableRow key={host.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedHosts.has(host.id)}
                    onCheckedChange={() => toggleHost(host.id)}
                  />
                </TableCell>
                <TableCell>{host.name}</TableCell>
                <TableCell>{host.code}</TableCell>
                <TableCell>{host.url}</TableCell>
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