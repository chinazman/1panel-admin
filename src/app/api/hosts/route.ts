import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const hostSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  entranceCode: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (session?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const data = hostSchema.parse(body)

    const host = await prisma.host.create({
      data: {
        name: data.name,
        url: data.url,
        entranceCode: data.entranceCode,
        username: data.username,
        password: data.password,
      },
    })

    return NextResponse.json(host)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("创建主机失败:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")

    const where = search
      ? {
          name: {
            contains: search,
          },
        }
      : {}

    const hosts = await prisma.host.findMany({
      where: {
        AND: [
          where,
          session.role === "ADMIN"
            ? {}
            : {
                users: {
                  some: {
                    userId: session.id,
                  },
                },
              },
        ],
      },
      select: {
        id: true,
        name: true,
        url: true,
        entranceCode: true,
        username: true,
      },
    })

    return NextResponse.json(hosts)
  } catch (error) {
    console.error("获取主机列表失败:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 