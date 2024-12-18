import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from './lib/auth'

export async function middleware(request: NextRequest) {
  const session = await updateSession(request)
  
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
  const publicPaths = ['/login', '/register', '/1panel-admin/jump.html']
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname)

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 管理员路径检查
  const adminPaths = ['/admin']
  const isAdminPath = adminPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAdminPath && session?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 