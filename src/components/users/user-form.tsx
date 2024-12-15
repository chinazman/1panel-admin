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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User } from "@/lib/types"

const userSchema = z.object({
  name: z.string().min(1, "请输入用户名"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6个字符").optional(),
  role: z.enum(["USER", "ADMIN"]),
})

type UserInput = z.infer<typeof userSchema>

interface UserFormProps {
  user?: Pick<User, "id" | "name" | "email" | "role">
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const schema = userSchema.refine((data) => {
    if (!data.password && !user) {
      return false
    }
    return true
  }, {
    message: "请输入密码",
    path: ["password"]
  })

  const form = useForm<UserInput>({
    resolver: zodResolver(schema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      password: "",
      role: user.role as "USER" | "ADMIN",
    } : {
      role: "USER", // 默认为普通用户
    },
  })

  async function onSubmit(data: UserInput) {
    setIsLoading(true)

    try {
      const response = await fetch(user ? `/api/users/${user.id}` : "/api/users", {
        method: user ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(user ? "更新失败" : "添加失败")
      }

      router.push("/admin/users")
      router.refresh()
    } catch (error) {
      console.error(user ? "更新用户失败:" : "添加用户失败:", error)
      alert(user ? "更新失败" : "添加失败")
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
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
              <FormLabel>{user ? "新密码" : "密码"}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户类型</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择用户类型" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USER">普通用户</SelectItem>
                  <SelectItem value="ADMIN">管理员</SelectItem>
                </SelectContent>
              </Select>
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
            {isLoading ? (user ? "更新中..." : "保存中...") : (user ? "更新" : "保存")}
          </Button>
        </div>
      </form>
    </Form>
  )
} 