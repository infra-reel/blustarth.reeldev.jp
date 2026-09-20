import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect(new URL('/manage/login', req.url))

  const res = await fetch(`${process.env.BACKEND_URL || 'http://backend:4000'}/api/auth/discord/callback?code=${code}`, {
    cache: 'no-store',
  })

  if (!res.ok) return NextResponse.redirect(new URL('/manage/login', req.url))

  const { token } = await res.json()
  const response = NextResponse.redirect(new URL('/manage', req.url))
  response.cookies.set('manage_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24h
    path: '/',
    sameSite: 'lax',
  })
  return response
}
