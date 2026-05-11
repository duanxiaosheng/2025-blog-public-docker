import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSessionToken, getSessionCookieName, verifyAdminPassword, verifySessionToken } from './auth'

function shouldUseSecureCookie(req?: NextRequest) {
	const forced = process.env.SESSION_COOKIE_SECURE
	if (forced === 'true') return true
	if (forced === 'false') return false
	const proto = req?.headers.get('x-forwarded-proto') || req?.nextUrl?.protocol?.replace(':', '')
	return proto === 'https'
}

export async function requireAdmin() {
	const cookieStore = await cookies()
	const token = cookieStore.get(getSessionCookieName())?.value
	if (!verifySessionToken(token)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}
	return null
}

export async function setAdminSessionCookie(req?: NextRequest) {
	const cookieStore = await cookies()
	cookieStore.set(getSessionCookieName(), createSessionToken(), {
		httpOnly: true,
		sameSite: 'lax',
		secure: shouldUseSecureCookie(req),
		path: '/',
		maxAge: 60 * 60 * 24 * 30
	})
}

export async function clearAdminSessionCookie(req?: NextRequest) {
	const cookieStore = await cookies()
	cookieStore.set(getSessionCookieName(), '', {
		httpOnly: true,
		sameSite: 'lax',
		secure: shouldUseSecureCookie(req),
		path: '/',
		maxAge: 0
	})
}

export async function loginFromRequest(req: NextRequest) {
	const body = await req.json().catch(() => null)
	const password = String(body?.password || '')
	if (!verifyAdminPassword(password)) {
		return NextResponse.json({ ok: false, error: '密码错误' }, { status: 401 })
	}
	await setAdminSessionCookie(req)
	return NextResponse.json({ ok: true })
}

export async function getSessionStatus() {
	const cookieStore = await cookies()
	const token = cookieStore.get(getSessionCookieName())?.value
	return NextResponse.json({ authenticated: verifySessionToken(token) })
}
