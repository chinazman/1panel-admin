import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const authSchema = z.object({
  userIds: z.array(z.string()),
})

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (session?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { userIds } = authSchema.parse(body)

    // 删除所有现有授权
    await prisma.hostUser.deleteMany({
      where: {
        hostId: params.id,
      },
    })

    // 创建新的授权
    if (userIds.length > 0) {
      await prisma.hostUser.createMany({
        data: userIds.map((userId) => ({
          hostId: params.id,
          userId,
        })),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("更新主机授权失败:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 