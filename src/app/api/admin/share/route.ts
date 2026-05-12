import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/local-admin/http'
import { writeContentJson } from '@/lib/local-admin/storage'
import { normalizePublicImagesForStorage } from '@/lib/local-admin/public-image-paths'
import { assertNoBlobImageUrls } from '@/lib/local-admin/blob-guards'

export async function POST(req: NextRequest) {
	const unauthorized = await requireAdmin()
	if (unauthorized) return unauthorized
	const body = await req.json().catch(() => null)
	const shares = normalizePublicImagesForStorage(Array.isArray(body?.shares) ? body.shares : [])
	try {
		assertNoBlobImageUrls(shares, ['logo'])
	} catch (error: any) {
		return NextResponse.json({ error: error?.message || '图片尚未上传完成' }, { status: 400 })
	}
	await writeContentJson('share.json', shares)
	return NextResponse.json({ ok: true })
}
