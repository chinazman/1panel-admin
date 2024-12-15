import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const hostSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  entranceCode: z.string().min(1),
  username: z.string().min(1),
  password: z.string().optional(),
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
    const data = hostSchema.parse(body)

    const updateData = {
      name: data.name,
      url: data.url,
      entranceCode: data.entranceCode,
      username: data.username,
      ...(data.password ? { password: data.password } : {}),
    }

    const host = await prisma.host.update({
      where: {
        id: params.id,
      },
      data: updateData,
    })

    return NextResponse.json(host)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("更新主机失败:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (session?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.host.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("删除主机失败:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 