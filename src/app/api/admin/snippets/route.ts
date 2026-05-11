import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/local-admin/http'
import { writeContentJson } from '@/lib/local-admin/storage'

export async function POST(req: NextRequest) {
	const unauthorized = await requireAdmin()
	if (unauthorized) return unauthorized
	const body = await req.json().catch(() => null)
	await writeContentJson('snippets.json', Array.isArray(body?.snippets) ? body.snippets : [])
	return NextResponse.json({ ok: true })
}
