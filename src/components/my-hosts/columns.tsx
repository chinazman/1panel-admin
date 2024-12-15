"use client"

import { ColumnDef } from "@tanstack/react-table"

type Host = {
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
] 