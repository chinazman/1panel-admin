import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const authSchema = z.object({
  hostIds: z.array(z.string()),
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
    const { hostIds } = authSchema.parse(body)

    // 删除所有现有授权
    await prisma.hostUser.deleteMany({
      where: {
        userId: id,
      },
    })

    // 创建新的授权
    if (hostIds.length > 0) {
      await prisma.hostUser.createMany({
        data: hostIds.map((hostId) => ({
          userId: id,
          hostId,
        })),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("更新用户授权失败:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 