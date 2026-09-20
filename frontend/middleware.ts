import { NextRequest, NextResponse } from 'next/server'

// /manage/login と /manage/callback は認証不要、それ以外の /manage/* は認証必須
export const config = {
  matcher: '/manage/:path*',
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 認証不要パス
  if (pathname === '/manage/login' || pathname.startsWith('/manage/callback')) {
    return NextResponse.next()
  }

  const token = req.cookies.get('manage_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/manage/login', req.url))
  }

  // バックエンドでトークン検証
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL || 'http://backend:4000'}/api/auth/verify`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
    )
    if (res.status === 401 || res.status === 403) {
      const response = NextResponse.redirect(new URL('/manage/login', req.url))
      response.cookies.delete('manage_token')
      return response
    }
    // バックエンド障害（5xx等）はそのまま通す（layout側で503表示）
  } catch {
    // 接続不能もそのまま通す（layout側で503表示）
  }

  return NextResponse.next()
}
