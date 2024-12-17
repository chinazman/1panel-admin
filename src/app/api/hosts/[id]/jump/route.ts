import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // 1. 获取主机信息,并验证权限
    const host = await prisma.host.findFirst({
      where: {
        id,
        users: {
          some: {
            userId: session.id,
          },
        },
      },
    })

    if (!host) {
      return new NextResponse("主机不存在或无权访问", { status: 404 })
    }

    // 2. 获取当前域名
    const currentHost = req.headers.get("host") || ""

    // 3. 拼接登录地址
    const loginUrl = `${host.url}/api/v1/auth/login`
    console.log('登录地址:', loginUrl)

    // 4. 发送登录请求
    const loginResponse = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Entrancecode": Buffer.from(host.entranceCode).toString("base64"),
      },
      body: JSON.stringify({
        name: host.username,
        password: host.password,
        ignoreCaptcha: true,
        captcha: "",
        captchaID: Math.random().toString(36).substring(7),
        authMethod: "session",
        language: "zh",
      }),
    })

    const loginData = await loginResponse.json()

    // 5. 处理登录响应
    if (loginData.code !== 200) {
      return new NextResponse(loginData.message || "登录失败", { status: 400 })
    }

    // 获取psession cookie
    const cookies = loginResponse.headers.getSetCookie()
    const psessionCookie = cookies.find(cookie => cookie.startsWith("psession="))
    
    if (!psessionCookie) {
      return new NextResponse("登录失败:未获取到会话信息", { status: 400 })
    }

    // 从psessionCookie中提取sessionId
    const sessionId = psessionCookie.match(/psession=([^;]+)/)?.[1]
    if (!sessionId) {
      return new NextResponse("无法获取会话ID", { status: 400 })
    }

    // 构建跳转URL
    const jumpUrl = `${host.code}.${currentHost}/jump?entrance=${encodeURIComponent(host.entranceCode)}&hostName=${encodeURIComponent(host.name)}&sessionId=${encodeURIComponent(sessionId)}`
    console.log('跳转地址:', jumpUrl)

    // 返回重定向响应
    const protocol = new URL(host.url).protocol
    const response = NextResponse.redirect(`${protocol}//${jumpUrl}`)
    
    return response

  } catch (error) {
    console.error("跳转失败:", error)
    return new NextResponse("跳转失败", { status: 500 })
  }
} 