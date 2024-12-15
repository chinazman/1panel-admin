import * as z from "zod"

export const loginSchema = z.object({
  email: z.string().email({
    message: "请输入有效的邮箱地址",
  }),
  password: z.string().min(6, {
    message: "密码至少需要6个字符",
  }),
})

export type LoginInput = z.infer<typeof loginSchema> 