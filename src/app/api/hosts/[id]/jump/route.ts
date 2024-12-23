import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getHostSessionId } from "@/lib/host"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 异步获取参数
    const { id } = await params

    // 1. 获取主机信息
    const host = await prisma.host.findFirst({
      where: {
        id,
        ...(session.role !== "ADMIN" ? {
          users: {
            some: {
              userId: session.id,
            },
          },
        } : {}),
      },
    })

    if (!host) {
      return new NextResponse("主机不存在或无权访问", { status: 404 })
    }

    // 2. 获取当前域名和协议 - 从环境变量获取
    const currentHost = process.env.PANEL_DOMAIN || req.headers.get("host") || ""
    const protocol = process.env.PANEL_PROTOCOL || "https"

    // 3. 获取 sessionId (使用新的公共方法)
    const sessionId = await getHostSessionId(host.id, false)

    // 4. 构建跳转URL
    const jumpUrl = `${host.code}.${currentHost}/1panel-admin/jump.html?entrance=${encodeURIComponent(host.entranceCode)}&hostName=${encodeURIComponent(host.name)}&sessionId=${encodeURIComponent(sessionId)}`
    
    // 5. 返回重定向响应
    const response = NextResponse.redirect(`${protocol}://${jumpUrl}`)
    return response

  } catch (error) {
    console.error("跳转失败:", error)
    return new NextResponse(error instanceof Error ? error.message : "跳转失败", { status: 500 })
  }
} 