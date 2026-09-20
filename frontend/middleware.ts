import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: '/manage/:path*',
}

function loginRedirect(req: NextRequest): NextResponse {
  // x-forwarded-host ヘッダーから外部ホストを復元
  // NEXT_PUBLIC_ ではなく SITE_URL（runtime env）を使う
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const host  = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'bluestarth.reeldev.jp'
  const res = NextResponse.redirect(`${proto}://${host}/manage/login`)
  res.cookies.delete('manage_token')
  return res
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname === '/manage/login' || pathname.startsWith('/manage/callback')) {
    return NextResponse.next()
  }

  const token = req.cookies.get('manage_token')?.value
  if (!token) return loginRedirect(req)

  try {
    const [, payload] = token.split('.')
    if (!payload) throw new Error('invalid')
    const decoded = JSON.parse(atob(payload))
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return loginRedirect(req)
  } catch {
    return loginRedirect(req)
  }

  return NextResponse.next()
}
