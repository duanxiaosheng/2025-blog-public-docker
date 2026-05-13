import { NextResponse } from 'next/server'
import { readContentJson, writeContentJson } from './storage'
import { assertNoBlobImageUrls } from './blob-guards'
import { normalizePublicImagesForDisplay, normalizePublicImagesForStorage } from './public-image-paths'

export type CollectionKey = 'about' | 'projects' | 'share' | 'bloggers' | 'pictures' | 'snippets' | 'apps'

type CollectionConfig = {
	file: string
	fallback: unknown
	imageFields?: string[]
	array: boolean
}

const COLLECTIONS: Record<CollectionKey, CollectionConfig> = {
	about: {
		file: 'about.json',
		fallback: { title: '', description: '', content: '' },
		array: false
	},
	projects: {
		file: 'projects.json',
		fallback: [],
		imageFields: ['image'],
		array: true
	},
	share: {
		file: 'share.json',
		fallback: [],
		imageFields: ['logo'],
		array: true
	},
	bloggers: {
		file: 'bloggers.json',
		fallback: [],
		imageFields: ['avatar'],
		array: true
	},
	pictures: {
		file: 'pictures.json',
		fallback: [],
		imageFields: ['image', 'images'],
		array: true
	},
	snippets: {
		file: 'snippets.json',
		fallback: [],
		array: true
	},
	apps: {
		file: 'apps.json',
		fallback: [],
		imageFields: ['icon'],
		array: true
	}
}

export function getCollectionConfig(key: CollectionKey) {
	return COLLECTIONS[key]
}

export async function readCollection<T = unknown>(key: CollectionKey): Promise<T> {
	const config = getCollectionConfig(key)
	const data = await readContentJson<T>(config.file, config.fallback as T)
	return config.imageFields?.length ? normalizePublicImagesForDisplay(data) : data
}

export async function writeCollection(key: CollectionKey, input: unknown) {
	const config = getCollectionConfig(key)
	let data = config.array ? (Array.isArray(input) ? input : []) : input
	if (config.imageFields?.length) {
		data = normalizePublicImagesForStorage(data)
		assertNoBlobImageUrls(data as unknown[], config.imageFields)
	}
	await writeContentJson(config.file, data)
	return data
}

export function collectionJson(data: unknown) {
	return NextResponse.json(data)
}

export function collectionError(error: unknown, fallback = '保存失败') {
	const message = error instanceof Error ? error.message : fallback
	return NextResponse.json({ error: message }, { status: 400 })
}
