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
  name: z.string().min(1, "名称不能为空"),
  code: z.string().min(1, "编码不能为空")
    .regex(/^[a-zA-Z0-9-_]+$/, "编码只能包含字母、数字、横线和下划线"),
  url: z.string().min(1, "地址不能为空"),
  entranceCode: z.string().min(1, "安全入口不能为空"),
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().optional(),
  publicKey: z.string().optional(),
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
      publicKey: host.publicKey || "",
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
        const result = await response.json()
        if (result.error === "主机编码已存在") {
          form.setError("code", {
            type: "manual",
            message: "该主机编码已被使用"
          })
          return
        }
        throw new Error(result.error || "操作失败")
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
                <Input {...field} placeholder="请输入主机编码" />
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
                <Input type="password" {...field}  placeholder="没有修改就不要填" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="publicKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>公钥</FormLabel>
              <FormControl>
                <Input {...field} placeholder="请输入公钥（可选）" />
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