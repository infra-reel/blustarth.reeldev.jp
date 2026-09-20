import { NextRequest, NextResponse } from 'next/server'

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

  // Edge Runtime で JWT をローカル検証（fetch不要）
  // JWT の構造確認のみ（署名検証は jose ライブラリが必要だが、
  // ここでは存在チェックのみ行い、実際の検証はバックエンドAPIで実施）
  try {
    const [, payload] = token.split('.')
    if (!payload) throw new Error('invalid')
    const decoded = JSON.parse(atob(payload))
    // exp チェック
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      const res = NextResponse.redirect(new URL('/manage/login', req.url))
      res.cookies.delete('manage_token')
      return res
    }
  } catch {
    const res = NextResponse.redirect(new URL('/manage/login', req.url))
    res.cookies.delete('manage_token')
    return res
  }

  return NextResponse.next()
}
