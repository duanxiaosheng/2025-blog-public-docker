import { createHash, timingSafeEqual } from 'crypto'

const DEFAULT_ADMIN_PASSWORD = 'Sheng123..'
const SESSION_COOKIE = 'blog_admin_session'

function sha256(input: string) {
	return createHash('sha256').update(input).digest('hex')
}

export function getAdminPassword() {
	return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
}

export function getSessionSecret() {
	return process.env.SESSION_SECRET || 'blog-local-secret-change-me'
}

export function getSessionCookieName() {
	return SESSION_COOKIE
}

export function verifyAdminPassword(password: string) {
	const expected = Buffer.from(sha256(getAdminPassword()))
	const actual = Buffer.from(sha256(password || ''))
	return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export function createSessionToken() {
	return sha256(`${getSessionSecret()}:${getAdminPassword()}`)
}

export function verifySessionToken(token?: string | null) {
	if (!token) return false
	const expected = Buffer.from(createSessionToken())
	const actual = Buffer.from(token)
	return expected.length === actual.length && timingSafeEqual(expected, actual)
}
