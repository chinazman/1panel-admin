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
  password: z.string().optional(),
  publicKey: z.string().optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (session?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const data = hostSchema.parse(body)
    
    const updateData = {
      name: data.name,
      code: data.code,
      url: data.url,
      entranceCode: data.entranceCode,
      username: data.username,
      publicKey: data.publicKey,
      ...(data.password ? { password: data.password } : {}),
    }
    // 检查修改后的 code 是否与其他主机冲突
    const existingHost = await prisma.host.findFirst({
      where: {
        code: data.code,
        NOT: { id }
      }
    })

    if (existingHost) {
      return NextResponse.json(
        { error: "主机编码已存在" },
        { status: 400 }
      )
    }

    const host = await prisma.host.update({
      where: {
        id,
      },
      data: updateData,
    })

    // 如果不是 main 主机,刷新 Nginx 配置
    if (host.code !== "main") {
      const panelDomain = process.env.PANEL_DOMAIN || req.headers.get("host") || ""
      await refreshNginxConfig(panelDomain)
    }

    return NextResponse.json(host)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 422 }
      )
    }

    console.error("更新主机失败:", error)
    return NextResponse.json(
      { error: "更新失败" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (session?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params

    // 获取主机信息
    const host = await prisma.host.findUnique({
      where: { id },
    })

    if (!host) {
      return new NextResponse("主机不存在", { status: 404 })
    }

    // 不允许删除 main 主机
    if (host.code === "main") {
      return new NextResponse("不能删除主面板", { status: 400 })
    }

    await prisma.host.delete({
      where: {
        id,
      },
    })

    // 刷新 Nginx 配置
    const panelDomain = process.env.PANEL_DOMAIN || req.headers.get("host") || ""
    await refreshNginxConfig(panelDomain)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("删除主机失败:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 