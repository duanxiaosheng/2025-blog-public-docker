import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
	createSessionToken,
	getSessionCookieName,
	initializeAdminPassword,
	isAdminInitialized,
	verifyAdminPassword,
	verifySessionToken
} from './auth'

function shouldUseSecureCookie(req?: NextRequest) {
	const forced = process.env.SESSION_COOKIE_SECURE
	if (forced === 'true') return true
	if (forced === 'false') return false
	const proto = req?.headers.get('x-forwarded-proto') || req?.nextUrl?.protocol?.replace(':', '')
	return proto === 'https'
}

export async function requireAdmin() {
	const initialized = await isAdminInitialized()
	if (!initialized) {
		return NextResponse.json({ error: 'Admin not initialized', code: 'ADMIN_NOT_INITIALIZED' }, { status: 403 })
	}
	const cookieStore = await cookies()
	const token = cookieStore.get(getSessionCookieName())?.value
	if (!(await verifySessionToken(token))) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}
	return null
}

export async function setAdminSessionCookie(req?: NextRequest) {
	const cookieStore = await cookies()
	cookieStore.set(getSessionCookieName(), await createSessionToken(), {
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
	const initialized = await isAdminInitialized()
	if (!initialized) {
		return NextResponse.json({ ok: false, error: '请先初始化管理员密码', code: 'ADMIN_NOT_INITIALIZED' }, { status: 403 })
	}
	const body = await req.json().catch(() => null)
	const password = String(body?.password || '')
	if (!(await verifyAdminPassword(password))) {
		return NextResponse.json({ ok: false, error: '密码错误' }, { status: 401 })
	}
	await setAdminSessionCookie(req)
	return NextResponse.json({ ok: true })
}

export async function initializeAdminFromRequest(req: NextRequest) {
	const initialized = await isAdminInitialized()
	if (initialized) {
		return NextResponse.json({ ok: false, error: '管理员密码已初始化' }, { status: 409 })
	}
	const body = await req.json().catch(() => null)
	const password = String(body?.password || '')
	const confirmPassword = String(body?.confirmPassword || '')
	if (!password || password.length < 6) {
		return NextResponse.json({ ok: false, error: '密码至少需要 6 位' }, { status: 400 })
	}
	if (password !== confirmPassword) {
		return NextResponse.json({ ok: false, error: '两次输入的密码不一致' }, { status: 400 })
	}
	await initializeAdminPassword(password)
	await setAdminSessionCookie(req)
	return NextResponse.json({ ok: true, initialized: true })
}

export async function getSessionStatus() {
	const cookieStore = await cookies()
	const token = cookieStore.get(getSessionCookieName())?.value
	return NextResponse.json({
		authenticated: await verifySessionToken(token),
		initialized: await isAdminInitialized(),
		usesEnvPassword: !!process.env.ADMIN_PASSWORD
	})
}
