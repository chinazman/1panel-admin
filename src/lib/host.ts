import { prisma } from "./prisma"
import { sessionCache } from "./cache"

interface LoginResponse {
  code: number
  message?: string
}

export async function getHostSessionId(hostId: string): Promise<string> {
  // 检查缓存
  const cachedSessionId = sessionCache.get(hostId)
  if (cachedSessionId) {
    //先不缓存了
    // return cachedSessionId
  }

  // 获取主机信息
  const host = await prisma.host.findUnique({
    where: { id: hostId }
  })

  if (!host) {
    throw new Error("主机不存在")
  }

  // 构建登录地址
  const loginUrl = `${host.url}/api/v1/auth/login`

  // 发送登录请求
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

  const loginData = (await loginResponse.json()) as LoginResponse

  if (loginData.code !== 200) {
    throw new Error(loginData.message || "登录失败")
  }

  // 获取 psession cookie
  const cookies = loginResponse.headers.getSetCookie()
  const psessionCookie = cookies.find(cookie => cookie.startsWith("psession="))
  
  if (!psessionCookie) {
    throw new Error("登录失败:未获取到会话信息")
  }

  // 从 psessionCookie 中提取 sessionId
  const sessionId = psessionCookie.match(/psession=([^;]+)/)?.[1]
  if (!sessionId) {
    throw new Error("无法获取会话ID")
  }

  // 缓存 sessionId，有效期 2 小时
  sessionCache.set(hostId, sessionId, 2 * 60 * 60 * 1000)

  return sessionId
} 