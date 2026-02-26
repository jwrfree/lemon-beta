import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const exchangeCodeForSession = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession,
    },
  })),
}))

describe('GET /auth/callback', () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset()
  })

  it('redirects to /home when exchange succeeds', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null })
    const { GET } = await import('./route')

    const response = await GET(new NextRequest('http://localhost:3000/auth/callback?code=abc'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/home')
    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc')
  })

  it('redirects to provided next path when safe', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null })
    const { GET } = await import('./route')

    const response = await GET(new NextRequest('http://localhost:3000/auth/callback?code=abc&next=/settings'))

    expect(response.headers.get('location')).toBe('http://localhost:3000/settings')
  })

  it('falls back to root with error when code exchange fails', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: 'invalid code' } })
    const { GET } = await import('./route')

    const response = await GET(new NextRequest('http://localhost:3000/auth/callback?code=bad'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/?error=google_oauth_failed')
  })

  it('falls back to root with error when code is missing', async () => {
    const { GET } = await import('./route')

    const response = await GET(new NextRequest('http://localhost:3000/auth/callback'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/?error=google_oauth_failed')
    expect(exchangeCodeForSession).not.toHaveBeenCalled()
  })
})
