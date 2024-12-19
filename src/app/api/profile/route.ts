import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const profileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
  confirmPassword: z.string().optional(),
})

export async function PUT(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const data = profileSchema.parse(body)

    // 验证当前密码
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // 只在修改密码时验证当前密码
    if (data.newPassword) {
      if (!data.currentPassword) {
        return new NextResponse("修改密码时需要验证当前密码", { status: 400 })
      }

      const isPasswordValid = await bcrypt.compare(
        data.currentPassword,
        user.password
      )

      if (!isPasswordValid) {
        return new NextResponse("当前密码错误", { status: 400 })
      }
    }

    // 检查邮箱是否被其他用户使用
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: {
          id: session.id,
        },
      },
    })

    if (existingUser) {
      return new NextResponse("邮箱已被使用", { status: 400 })
    }

    // 更新用户信息
    const updateData = {
      name: data.name,
      email: data.email,
      ...(data.newPassword
        ? { password: await bcrypt.hash(data.newPassword, 10) }
        : {}),
    }

    await prisma.user.update({
      where: { id: session.id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("更新个人信息失败:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 