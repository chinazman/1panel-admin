import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { User } from "./types"
import { NextRequest } from "next/server"

const key = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
const alg = "HS256"

type Session = Pick<User, "id" | "email" | "name" | "role">

export async function encrypt(session: Session): Promise<string> {
  return new SignJWT(session)
    .setProtectedHeader({ alg })
    .setExpirationTime("1d")
    .sign(key)
}

export async function decrypt(token: string): Promise<Session> {
  const { payload } = await jwtVerify(token, key, {
    algorithms: [alg],
  })
  return payload as Session
}

export async function getSession(): Promise<Session | null> {
  try {
    console.log('=== getSession 开始 ===')
    const token = (await cookies()).get("token")?.value
    console.log('getSession token:', token ? '存在' : '不存在')
    if (!token) return null
    const session = await decrypt(token)
    console.log('getSession 解密结果:', session ? `成功 (${session.role})` : '失败')
    return session
  } catch (error) {
    console.error('getSession 错误:', error)
    return null
  }
}

export async function updateSession(request: NextRequest): Promise<Session | null> {
  try {
    console.log('=== updateSession 开始 ===')
    const token = request.cookies.get("token")?.value
    console.log('updateSession token:', token ? '存在' : '不存在')
    if (!token) return null
    const session = await decrypt(token)
    console.log('updateSession 解密结果:', session ? `成功 (${session.role})` : '失败')
    return session
  } catch (error) {
    console.error('updateSession 错误:', error)
    return null
  }
} 