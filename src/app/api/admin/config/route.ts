import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/local-admin/http'
import { savePublicAsset, deletePublicAsset, writeConfigJson } from '@/lib/local-admin/storage'
import { normalizePublicImagesForStorage } from '@/lib/local-admin/public-image-paths'

export async function POST(req: NextRequest) {
	const unauthorized = await requireAdmin()
	if (unauthorized) return unauthorized
	const body = await req.json().catch(() => null)
	const uploads = Array.isArray(body?.uploads) ? body.uploads : []
	const removals = Array.isArray(body?.removals) ? body.removals : []
	for (const item of uploads) {
		if (item?.relativePath && item?.contentBase64) {
			await savePublicAsset(String(item.relativePath), String(item.contentBase64))
		}
	}
	for (const item of removals) {
		if (item) await deletePublicAsset(String(item))
	}
	await writeConfigJson('site-content.json', normalizePublicImagesForStorage(body?.siteContent || {}))
	await writeConfigJson('card-styles.json', body?.cardStyles || {})
	return NextResponse.json({ ok: true })
}
