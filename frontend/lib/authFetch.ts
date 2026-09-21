'use client'

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Cookie から manage_token を取得
  const token = document.cookie
    .split('; ')
    .find(r => r.startsWith('manage_token='))
    ?.split('=')[1]

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}
