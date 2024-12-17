import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from './lib/auth'

export async function middleware(request: NextRequest) {
  console.log('=== 中间件开始 ===')
  console.log('当前路径:', request.nextUrl.pathname)
  
  const session = await updateSession(request)
  console.log('会话状态:', session ? `已登录 (${session.role})` : '未登录')
  
  // 处理根路径重定向
  if (request.nextUrl.pathname === '/') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (session.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/hosts', request.url))
    }
    return NextResponse.redirect(new URL('/my-hosts', request.url))
  }

  // 公开路径
  const publicPaths = ['/login', '/register', '/jump']
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname)
  console.log('是否公开路径:', isPublicPath)

  if (!session && !isPublicPath) {
    console.log('未登录访问非公开路径，重定向到登录页')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 管理员路径检查
  const adminPaths = ['/admin']
  const isAdminPath = adminPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  console.log('是否管理员路径:', isAdminPath)

  if (isAdminPath && session?.role !== 'ADMIN') {
    console.log('非管理员访问管理路径，重定向到首页')
    return NextResponse.redirect(new URL('/', request.url))
  }

  console.log('=== 中间件结束：允许访问 ===')
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 