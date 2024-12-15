import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from './lib/auth'

export async function middleware(request: NextRequest) {
  const session = await updateSession(request)
  
  // 公开路径
  const publicPaths = ['/login', '/register']
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname)

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
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