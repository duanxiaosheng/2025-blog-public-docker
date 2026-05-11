import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/local-admin/http'
import { writeContentJson } from '@/lib/local-admin/storage'

export async function POST(req: NextRequest) {
	const unauthorized = await requireAdmin()
	if (unauthorized) return unauthorized
	const body = await req.json().catch(() => null)
	await writeContentJson('pictures.json', Array.isArray(body?.pictures) ? body.pictures : [])
	return NextResponse.json({ ok: true })
}
