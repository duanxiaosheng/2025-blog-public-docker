import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/local-admin/http'
import { savePublicAsset, deletePublicAsset, writeConfigJson } from '@/lib/local-admin/storage'
import { normalizePublicImagesForStorage } from '@/lib/local-admin/public-image-paths'
import { stat } from 'fs/promises'
import path from 'path'

function toStoragePath(url: string) {
	if (!url) return url
	if (url.startsWith('/api/images/')) return url.replace('/api/images/', '/images/')
	return url
}

async function assetExists(storagePath: string) {
	if (!storagePath?.startsWith('/images/')) return true
	const dataPath = path.join(process.cwd(), 'data', 'public', storagePath.replace(/^\//, ''))
	const sourcePath = path.join(process.cwd(), 'public', storagePath.replace(/^\/images\//, 'images/'))
	try {
		await stat(dataPath)
		return true
	} catch {}
	try {
		await stat(sourcePath)
		return true
	} catch {
		return false
	}
}

async function sanitizeSiteContentForMissingAssets(input: any) {
	const next = { ...(input || {}) }
	if (Array.isArray(next.artImages)) {
		const artImages = []
		for (const item of next.artImages) {
			const url = toStoragePath(String(item?.url || ''))
			if (!url || !url.startsWith('/images/')) {
				artImages.push(item)
				continue
			}
			if (await assetExists(url)) artImages.push(item)
		}
		next.artImages = artImages
		if (next.currentArtImageId && !artImages.some((item: any) => item?.id === next.currentArtImageId)) {
			next.currentArtImageId = artImages[0]?.id || ''
		}
	}
	if (Array.isArray(next.backgroundImages)) {
		const backgroundImages = []
		for (const item of next.backgroundImages) {
			const url = toStoragePath(String(item?.url || ''))
			if (!url) continue
			if (!url.startsWith('/images/')) {
				backgroundImages.push(item)
				continue
			}
			if (await assetExists(url)) backgroundImages.push(item)
		}
		next.backgroundImages = backgroundImages
		if (next.currentBackgroundImageId && !backgroundImages.some((item: any) => item?.id === next.currentBackgroundImageId)) {
			next.currentBackgroundImageId = backgroundImages[0]?.id || ''
		}
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
	const normalizedSiteContent = normalizePublicImagesForStorage(body?.siteContent || {})
	const safeSiteContent = await sanitizeSiteContentForMissingAssets(normalizedSiteContent)
	await writeConfigJson('site-content.json', safeSiteContent)
	await writeConfigJson('card-styles.json', body?.cardStyles || {})
	return NextResponse.json({ ok: true })
}
