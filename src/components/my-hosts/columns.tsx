"use client"

import { ColumnDef } from "@tanstack/react-table"

type Host = {
  id: string
  name: string
  address: string
  port: number
  username: string
}

export const columns: ColumnDef<Host>[] = [
  {
    accessorKey: "name",
    header: "主机名称",
  },
  {
    accessorKey: "address",
    header: "地址",
  },
  {
    accessorKey: "port",
    header: "端口",
  },
  {
    accessorKey: "username",
    header: "用户名",
  },
] 