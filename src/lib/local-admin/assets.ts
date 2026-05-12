import path from 'path'
import { hashPassword } from './auth'

export const PUBLIC_IMAGE_SECTIONS = ['project', 'share', 'blogger', 'pictures'] as const
export type PublicImageSection = (typeof PUBLIC_IMAGE_SECTIONS)[number]

const PUBLIC_IMAGE_SECTION_SET = new Set<string>(PUBLIC_IMAGE_SECTIONS)

export function normalizeAssetFilename(filename: string, fallback = 'image.png') {
	const ext = path.extname(filename || '').toLowerCase() || path.extname(fallback).toLowerCase() || '.png'
	const base = path.basename(filename || fallback, ext).toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'file'
	return `${base}-${hashPassword(`${base}:${Date.now()}:${Math.random()}`).slice(0, 12)}${ext}`
}

export function normalizePublicImageSection(input: string): PublicImageSection | null {
	const section = String(input || '').trim().toLowerCase()
	return PUBLIC_IMAGE_SECTION_SET.has(section) ? (section as PublicImageSection) : null
}

export function publicImageStoragePath(section: PublicImageSection, filename: string) {
	return `/images/${section}/${filename}`
}

export function publicImageDisplayPath(storagePath: string) {
	if (storagePath.startsWith('/api/images/')) return storagePath
	if (storagePath.startsWith('/images/')) return `/api${storagePath}`
	return storagePath
}

export function publicImageStoredPath(displayPath: string) {
	if (displayPath.startsWith('/api/images/')) return displayPath.replace('/api/images/', '/images/')
	return displayPath
}
