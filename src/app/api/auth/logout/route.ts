import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  // 创建响应
  const response = NextResponse.json({ success: true });
  
  // 删除 cookie
  (await cookies()).set({
    name: "token",
    value: "",
    expires: new Date(0),
    path: "/",
  })

  return response
} 