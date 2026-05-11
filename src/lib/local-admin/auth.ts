import { createHash, timingSafeEqual } from 'crypto'
import { readConfigJson, writeConfigJson } from './storage'

const SESSION_COOKIE = 'blog_admin_session'
const DEFAULT_SESSION_SECRET = 'blog-local-secret-change-me'
const ADMIN_CONFIG_FILE = 'admin-auth.json'

type AdminAuthConfig = {
	passwordHash?: string
	initializedAt?: string
}

function sha256(input: string) {
	return createHash('sha256').update(input).digest('hex')
}

export function hashPassword(password: string) {
	return sha256(password || '')
}

export async function getAdminAuthConfig() {
	return readConfigJson<AdminAuthConfig>(ADMIN_CONFIG_FILE, {})
}

export async function isAdminInitialized() {
	if (process.env.ADMIN_PASSWORD) return true
	const config = await getAdminAuthConfig()
	return !!config.passwordHash
}

export async function initializeAdminPassword(password: string) {
	const next: AdminAuthConfig = {
		passwordHash: hashPassword(password),
		initializedAt: new Date().toISOString()
	}
	await writeConfigJson(ADMIN_CONFIG_FILE, next)
	return next
}

export function getSessionSecret() {
	return process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET
}

export function getSessionCookieName() {
	return SESSION_COOKIE
}

async function getStoredAdminPasswordHash() {
	if (process.env.ADMIN_PASSWORD) return hashPassword(process.env.ADMIN_PASSWORD)
	const config = await getAdminAuthConfig()
	return config.passwordHash || null
}

export async function verifyAdminPassword(password: string) {
	const expectedHash = await getStoredAdminPasswordHash()
	if (!expectedHash) return false
	const expected = Buffer.from(expectedHash)
	const actual = Buffer.from(hashPassword(password || ''))
	return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export async function createSessionToken() {
	const passwordHash = (await getStoredAdminPasswordHash()) || 'uninitialized'
	return sha256(`${getSessionSecret()}:${passwordHash}`)
}

export async function verifySessionToken(token?: string | null) {
	if (!token) return false
	const expectedToken = await createSessionToken()
	const expected = Buffer.from(expectedToken)
	const actual = Buffer.from(token)
	return expected.length === actual.length && timingSafeEqual(expected, actual)
}
