"use client"

import { ColumnDef } from "@tanstack/react-table"

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
] 