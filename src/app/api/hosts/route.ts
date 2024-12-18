import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { refreshNginxConfig } from "@/lib/nginx"

const hostSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  code: z.string().min(1, "编码不能为空")
    .regex(/^[a-zA-Z0-9-_]+$/, "编码只能包含字母、数字、横线和下划线"),
  url: z.string().min(1, "地址不能为空"),
  entranceCode: z.string().min(1, "安全入口不能为空"),
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空"),
})

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (session?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const data = hostSchema.parse(body)

    // 检查 code 是否已存在
    const existingHost = await prisma.host.findUnique({
      where: { code: data.code }
    })

    if (existingHost) {
      return NextResponse.json(
        { error: "主机编码已存在" },
        { status: 400 }
      )
    }

    const host = await prisma.host.create({
      data: {
        name: data.name,
        code: data.code,
        url: data.url,
        entranceCode: data.entranceCode,
        username: data.username,
        password: data.password,
      },
    })

    // 获取域名
    const panelDomain = process.env.PANEL_DOMAIN || req.headers.get("host") || ""
    
    // 刷新 Nginx 配置
    await refreshNginxConfig(panelDomain)

    return NextResponse.json(host)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 422 }
      )
    }

    console.error("创建主机失败:", error)
    return NextResponse.json(
      { error: "创建失败" },
      { status: 500 }
    )
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
        code: true,
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