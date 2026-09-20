import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: '/manage/:path*',
}

// Pod内部ホスト名ではなく外部URLでリダイレクトするためのヘルパー
function redirectTo(path: string, req: NextRequest): NextResponse {
  // NEXT_PUBLIC_SITE_URL 環境変数があればそれを使う
  // なければ x-forwarded-host / host ヘッダーから外部URLを復元
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  let base: string
  if (siteUrl) {
    base = siteUrl.replace(/\/$/, '')
  } else {
    const proto = req.headers.get('x-forwarded-proto') ?? 'https'
    const host  = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost'
    base = `${proto}://${host}`
  }

  return NextResponse.redirect(`${base}${path}`)
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 認証不要パス
  if (pathname === '/manage/login' || pathname.startsWith('/manage/callback')) {
    return NextResponse.next()
  }

  const token = req.cookies.get('manage_token')?.value
  if (!token) {
    return redirectTo('/manage/login', req)
  }

  // JWT の exp チェック（Edge Runtime でローカル検証）
  try {
    const [, payload] = token.split('.')
    if (!payload) throw new Error('invalid')
    const decoded = JSON.parse(atob(payload))
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      const res = redirectTo('/manage/login', req)
      res.cookies.delete('manage_token')
      return res
    }
  } catch {
    const res = redirectTo('/manage/login', req)
    res.cookies.delete('manage_token')
    return res
  }

  return NextResponse.next()
}
