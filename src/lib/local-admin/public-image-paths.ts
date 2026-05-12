import { publicImageDisplayPath, publicImageStoredPath } from './assets'

function normalizeDisplayUrl(value: string) {
	if (!value) return value
	const next = value.replace(/^\/api(?:\/api)+\/images\//, '/api/images/')
	return publicImageDisplayPath(next)
}

function normalizeStorageUrl(value: string) {
	if (!value) return value
	const next = value.replace(/^\/api(?:\/api)+\/images\//, '/api/images/')
	if (next.startsWith('/api/site-assets/avatar')) return '/images/avatar.png'
	if (next.startsWith('/api/site-assets/favicon')) return '/images/favicon.png'
	return publicImageStoredPath(next)
}

function mapDeep(value: unknown, mapper: (value: string) => string): unknown {
	if (typeof value === 'string') return mapper(value)
	if (Array.isArray(value)) return value.map(item => mapDeep(item, mapper))
	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, mapDeep(item, mapper)]))
	}
	return value
}

export function normalizePublicImagesForDisplay<T>(data: T): T {
	return mapDeep(data, normalizeDisplayUrl) as T
}

export function normalizePublicImagesForStorage<T>(data: T): T {
	return mapDeep(data, normalizeStorageUrl) as T
}
