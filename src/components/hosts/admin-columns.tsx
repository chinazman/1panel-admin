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

type Host = {
  id: string
  name: string
  url: string
  entranceCode: string
  username: string
}

export const columns: ColumnDef<Host>[] = [
  {
    accessorKey: "name",
    header: "主机名称",
  },
  {
    accessorKey: "url",
    header: "地址",
  },
  {
    accessorKey: "entranceCode",
    header: "安全入口",
  },
  {
    accessorKey: "username",
    header: "用户名",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const host = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/hosts/${host.id}/edit`}>编辑</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/hosts/${host.id}/auth`}>授权</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDelete(host.id)}
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
  if (!confirm("确定要删除这个主机吗？")) {
    return
  }

  try {
    const response = await fetch(`/api/hosts/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("删除失败")
    }

    window.location.reload()
  } catch (error) {
    console.error("删除主机失败:", error)
    alert("删除失败")
  }
} 