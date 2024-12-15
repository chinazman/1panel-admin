"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "用户名",
  },
  {
    accessorKey: "email",
    header: "邮箱",
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString()
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/users/${user.id}/edit`}>编辑</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDelete(user.id)}
            >
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

async function handleDelete(id: string) {
  if (!confirm("确定要删除这个用户吗？")) {
    return
  }

  try {
    const response = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("删除失败")
    }

    window.location.reload()
  } catch (error) {
    console.error("删除用户失败:", error)
    alert("删除失败")
  }
} 