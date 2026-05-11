import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/local-admin/http'
import { savePublicAsset, deletePublicAsset, writeConfigJson } from '@/lib/local-admin/storage'

function toStoragePath(url: string) {
	if (!url) return url
	if (url.startsWith('/api/images/')) return url.replace('/api/images/', '/images/')
	return url
}

function normalizeSiteContentForStorage(data: any) {
	const next = { ...(data || {}) }
	if (Array.isArray(next.artImages)) {
		next.artImages = next.artImages.map((item: any) => ({
			...item,
			url: toStoragePath(String(item?.url || ''))
		}))
	}
	if (Array.isArray(next.backgroundImages)) {
		next.backgroundImages = next.backgroundImages.map((item: any) => ({
			...item,
			url: toStoragePath(String(item?.url || ''))
		}))
	}
	if (Array.isArray(next.socialButtons)) {
		next.socialButtons = next.socialButtons.map((item: any) => ({
			...item,
			value: typeof item?.value === 'string' ? toStoragePath(item.value) : item?.value
		}))
	}
	return next
}

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
	await writeConfigJson('site-content.json', normalizeSiteContentForStorage(body?.siteContent || {}))
	await writeConfigJson('card-styles.json', body?.cardStyles || {})
	return NextResponse.json({ ok: true })
}
