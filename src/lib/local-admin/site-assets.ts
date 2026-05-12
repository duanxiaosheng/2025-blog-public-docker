import { stat, readFile } from 'fs/promises'
import path from 'path'
import { ensureDataSeeded, getPublicDir } from '@/lib/local-admin/storage'

export type SiteAssetKind = 'avatar' | 'favicon'

const SOURCE_PUBLIC_DIR = path.join(process.cwd(), 'public')
const ASSETS: Record<SiteAssetKind, { filename: string; contentType: string }> = {
	avatar: { filename: 'avatar.png', contentType: 'image/png' },
	favicon: { filename: 'favicon.png', contentType: 'image/png' }
}

async function exists(filePath: string) {
	try {
		await stat(filePath)
		return true
	} catch {
		return false
	}
}

export function getSiteAssetFilename(kind: SiteAssetKind) {
	return ASSETS[kind].filename
}

export function getSiteAssetStoragePath(kind: SiteAssetKind) {
	return `/images/${ASSETS[kind].filename}`
}

export async function getSiteAssetVersion(kind: SiteAssetKind) {
	await ensureDataSeeded()
	const filename = ASSETS[kind].filename
	const dataFilePath = path.join(getPublicDir(), 'images', filename)
	const sourceFilePath = path.join(SOURCE_PUBLIC_DIR, 'images', filename)
	const fallbackFilePath = path.join(SOURCE_PUBLIC_DIR, filename)
	for (const filePath of [dataFilePath, sourceFilePath, fallbackFilePath]) {
		try {
			const info = await stat(filePath)
			return `${Math.floor(info.mtimeMs)}-${info.size}`
		} catch {}
	}
	return 'missing'
}

export async function readSiteAsset(kind: SiteAssetKind) {
	await ensureDataSeeded()
	const asset = ASSETS[kind]
	const dataFilePath = path.join(getPublicDir(), 'images', asset.filename)
	const sourceFilePath = path.join(SOURCE_PUBLIC_DIR, 'images', asset.filename)
	const fallbackFilePath = path.join(SOURCE_PUBLIC_DIR, asset.filename)
	const filePath = (await exists(dataFilePath)) ? dataFilePath : (await exists(sourceFilePath)) ? sourceFilePath : fallbackFilePath
	const buffer = await readFile(filePath)
	const version = await getSiteAssetVersion(kind)
	return { buffer, contentType: asset.contentType, version }
}
