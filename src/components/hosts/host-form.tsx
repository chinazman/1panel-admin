"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Host } from "@/lib/types"

const hostSchema = z.object({
  name: z.string().min(1, "请输入主机名称"),
  code: z.string().min(1, "请输入主机编码"),
  url: z.string().min(1, "请输入主机地址"),
  entranceCode: z.string().min(1, "请输入安全入口"),
  username: z.string().min(1, "请输入用户名"),
  password: z.string().optional(),
})

type HostInput = z.infer<typeof hostSchema>

interface HostFormProps {
  host?: Host
}

export function HostForm({ host }: HostFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const schema = hostSchema.refine((data) => {
    // 新增时密码必填，编辑时可选
    if (!data.password && !host) {
      return false
    }
    return true
  }, {
    message: "请输入密码",
    path: ["password"]
  })

  const form = useForm<HostInput>({
    resolver: zodResolver(schema),
    defaultValues: host ? {
      name: host.name,
      code: host.code,
      url: host.url,
      entranceCode: host.entranceCode,
      username: host.username,
      password: "",
    } : undefined,
  })

  async function onSubmit(data: HostInput) {
    setIsLoading(true)

    try {
      const response = await fetch(host ? `/api/hosts/${host.id}` : "/api/hosts", {
        method: host ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(host ? "更新失败" : "添加失败")
      }

      router.push("/admin/hosts")
      router.refresh()
    } catch (error) {
      console.error(host ? "更新主机失败:" : "添加主机失败:", error)
      alert(host ? "更新失败" : "添加失败")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>主机名称</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>主机编码</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>地址</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="entranceCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>安全入口</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (host ? "更新中..." : "保存中...") : (host ? "更新" : "保存")}
          </Button>
        </div>
      </form>
    </Form>
  )
} 