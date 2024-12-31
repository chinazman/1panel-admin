import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(["USER", "ADMIN"]),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (session?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const data = userSchema.parse(body)

    // 检查邮箱是否被其他用户使用
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: {
          id,
        },
      },
    })

    if (existingUser) {
      return new NextResponse("邮箱已被使用", { status: 400 })
    }

    const updateData = {
      name: data.name,
      email: data.email,
      role: data.role,
      ...(data.password ? { password: await bcrypt.hash(data.password, 10) } : {}),
    }

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: updateData,
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("更新用户失败:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (session?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params

    // 检查是否是最后一个管理员
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (user?.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      })

      if (adminCount <= 1) {
        return new NextResponse("不能删除最后一个管理员", { status: 400 })
      }
    }

    // 删除用户
    await prisma.user.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("删除用户失败:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 