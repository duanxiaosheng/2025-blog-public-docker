function normalizeDisplayUrl(value: string) {
	if (!value) return value
	let next = value.replace(/^\/api(?:\/api)+\/images\//, '/api/images/')
	if (next.startsWith('/images/')) return `/api${next}`
	return next
}

function normalizeStorageUrl(value: string) {
	if (!value) return value
	let next = value.replace(/^\/api(?:\/api)+\/images\//, '/api/images/')
	if (next.startsWith('/api/images/')) return next.replace('/api/images/', '/images/')
	return next
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
