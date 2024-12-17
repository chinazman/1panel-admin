"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"

export type Host = {
  id: string
  name: string
  code: string
}

export const columns: ColumnDef<Host>[] = [
  {
    accessorKey: "name",
    header: "主机名称",
  },
  {
    accessorKey: "code",
    header: "主机编码",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const host = row.original

      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            window.open(`/api/hosts/${host.id}/jump`, '_blank')
          }}
        >
          跳转
        </Button>
      )
    },
  },
] 