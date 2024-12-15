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
  address: z.string().min(1, "请输入主机地址"),
  port: z.coerce.number().min(1, "请输入有效的端口号"),
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
})

type HostInput = z.infer<typeof hostSchema>

interface HostFormProps {
  host?: Host
}

export function HostForm({ host }: HostFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<HostInput>({
    resolver: zodResolver(hostSchema),
    defaultValues: host ? {
      name: host.name,
      address: host.address,
      port: host.port,
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
          name="address"
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
          name="port"
          render={({ field }) => (
            <FormItem>
              <FormLabel>端口</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
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