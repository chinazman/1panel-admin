import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/auth"
import { loginSchema } from "@/lib/validations/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return new NextResponse("用户不存在", { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return new NextResponse("密码错误", { status: 401 })
    }

    // 创建 session
    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    // 加密 session 并设置 cookie
    const token = await encrypt(session)
    
    // 创建响应
    const response = NextResponse.json(session)
    
    // 设置 cookie
    await cookies().set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    return new NextResponse("Internal server error", { status: 500 })
  }
} 