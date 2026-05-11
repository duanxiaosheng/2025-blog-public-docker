import { clearAdminSessionCookie } from '@/lib/local-admin/http'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	await clearAdminSessionCookie(req)
	return NextResponse.json({ ok: true })
}
