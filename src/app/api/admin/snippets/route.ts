import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/local-admin/http'
import { collectionError, writeCollection } from '@/lib/local-admin/content-repository'

export async function POST(req: NextRequest) {
	const unauthorized = await requireAdmin()
	if (unauthorized) return unauthorized
	const body = await req.json().catch(() => null)
	try {
		await writeCollection('snippets', body?.snippets)
		return NextResponse.json({ ok: true })
	} catch (error) {
		return collectionError(error)
	}
}
