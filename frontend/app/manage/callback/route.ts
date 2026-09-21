import { NextRequest, NextResponse } from 'next/server'

function siteUrl(req: NextRequest, path: string): string {
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const host  = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'bluestarth.reeldev.jp'
  return `${proto}://${host}${path}`
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect(siteUrl(req, '/manage/login'))

  const res = await fetch(`${process.env.BACKEND_URL || 'http://backend:4000'}/api/auth/discord/callback?code=${code}`, {
    cache: 'no-store',
  })

  if (!res.ok) return NextResponse.redirect(siteUrl(req, '/manage/login'))

  const { token } = await res.json()
  const response = NextResponse.redirect(siteUrl(req, '/manage'))
  response.cookies.set('manage_token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24,
    path: '/',
    sameSite: 'lax',
  })
  return response
}
