import { readFile, readdir, rm, stat } from 'fs/promises'
import path from 'path'
import { ensureDataSeeded, getBlogsDir, getPublicDir } from './storage'

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif'])
const PROTECTED_ASSETS = new Set(['/images/avatar.png', '/images/favicon.png'])

type ReferenceMap = Map<string, Set<string>>

export type AssetInventoryItem = {
	path: string
	url: string
	used: boolean
	protected: boolean
	deletable: boolean
	size: number
	sizeLabel: string
	source: 'images' | 'blogs'
	ext: string
	references: string[]
}

export type AssetInventory = {
	assets: AssetInventoryItem[]
	summary: {
		total: number
		used: number
		unused: number
		protected: number
		deletable: number
		totalBytes: number
		unusedBytes: number
	}
}

function isImageFile(filePath: string) {
	return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

function isIgnoredFile(filePath: string) {
	const base = path.basename(filePath)
	return base === '.gitkeep' || base.startsWith('.') || base.endsWith('.tmp') || base === 'index.md' || base === 'config.json' || base === 'index.json' || base === 'categories.json'
}

async function walkFiles(dir: string): Promise<string[]> {
	try {
		const entries = await readdir(dir, { withFileTypes: true })
		const result: string[] = []
		for (const entry of entries) {
			const filePath = path.join(dir, entry.name)
			if (entry.isDirectory()) result.push(...(await walkFiles(filePath)))
			else if (entry.isFile()) result.push(filePath)
		}
		return result
	} catch {
		return []
	}
}

function normalizeAssetReference(input: string) {
	if (!input) return null
	let value = input.trim().replace(/^['"]|['"]$/g, '')
	if (!value || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) return null
	while (value.includes('/api/api/')) value = value.replaceAll('/api/api/', '/api/')
	const queryIndex = value.search(/[?#]/)
	if (queryIndex >= 0) value = value.slice(0, queryIndex)
	if (value.startsWith('/api/images/')) return value.replace('/api/images/', '/images/')
	if (value.startsWith('/api/blogs/')) return value.replace('/api/blogs/', '/blogs/')
	if (value.startsWith('/api/site-assets/avatar')) return '/images/avatar.png'
	if (value.startsWith('/api/site-assets/favicon')) return '/images/favicon.png'
	if (value.startsWith('/images/') || value.startsWith('/blogs/')) return value
	return null
}

function addReference(references: ReferenceMap, assetPath: string, source: string) {
	const normalized = normalizeAssetReference(assetPath)
	if (!normalized) return
	if (!references.has(normalized)) references.set(normalized, new Set())
	references.get(normalized)!.add(source)
}

function visitStrings(value: unknown, visitor: (value: string, trail: string[]) => void, trail: string[] = []) {
	if (typeof value === 'string') {
		visitor(value, trail)
		return
	}
	if (Array.isArray(value)) {
		value.forEach((item, index) => visitStrings(item, visitor, [...trail, String(index)]))
		return
	}
	if (value && typeof value === 'object') {
		Object.entries(value).forEach(([key, item]) => visitStrings(item, visitor, [...trail, key]))
	}
}

function pointer(trail: string[]) {
	return trail.length ? trail.join('.') : '<root>'
}

async function readJson(filePath: string) {
	try {
		return JSON.parse(await readFile(filePath, 'utf8'))
	} catch {
		return null
	}
}

async function collectJsonReferences(filePath: string, references: ReferenceMap) {
	const data = await readJson(filePath)
	if (!data) return
	visitStrings(data, (value, trail) => {
		const normalized = normalizeAssetReference(value)
		if (normalized) addReference(references, normalized, `${path.relative(process.cwd(), filePath)}#${pointer(trail)}`)
	})
}

function collectTextReferences(text: string, source: string, references: ReferenceMap) {
	const patterns = [
		/!\[[^\]]*\]\(([^)]+)\)/g,
		/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
		/(\/api\/images\/[^\s)'"<>]+)/g,
		/(\/api\/blogs\/[^\s)'"<>]+)/g,
		/(\/images\/[^\s)'"<>]+)/g,
		/(\/blogs\/[^\s)'"<>]+)/g
	]
	for (const pattern of patterns) {
		let match: RegExpExecArray | null
		while ((match = pattern.exec(text))) {
			addReference(references, match[1], source)
		}
	}
}

async function collectReferences() {
	const references: ReferenceMap = new Map()
	const publicDir = getPublicDir()
	const dataDir = path.dirname(publicDir)
	const contentDir = path.join(dataDir, 'content')
	const configDir = path.join(dataDir, 'config')
	const blogsDir = getBlogsDir()

	for (const filePath of await walkFiles(contentDir)) {
		if (filePath.endsWith('.json')) await collectJsonReferences(filePath, references)
	}
	for (const filePath of await walkFiles(configDir)) {
		if (filePath.endsWith('.json')) await collectJsonReferences(filePath, references)
	}
	for (const filePath of await walkFiles(blogsDir)) {
		if (filePath.endsWith('.json')) await collectJsonReferences(filePath, references)
		else if (filePath.endsWith('.md')) collectTextReferences(await readFile(filePath, 'utf8'), path.relative(process.cwd(), filePath), references)
	}

	for (const protectedAsset of PROTECTED_ASSETS) addReference(references, protectedAsset, 'protected-site-asset')
	return references
}

function toStoragePath(filePath: string, publicDir: string) {
	const relative = path.relative(publicDir, filePath).split(path.sep).join('/')
	return `/${relative}`
}

function toDisplayUrl(storagePath: string) {
	if (storagePath.startsWith('/images/')) return `/api${storagePath}`
	if (storagePath.startsWith('/blogs/')) return `/api${storagePath}`
	return storagePath
}

function formatBytes(bytes: number) {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export async function getAssetInventory(): Promise<AssetInventory> {
	await ensureDataSeeded()
	const publicDir = getPublicDir()
	const references = await collectReferences()
	const files = await walkFiles(publicDir)
	const assets: AssetInventoryItem[] = []

	for (const filePath of files) {
		if (isIgnoredFile(filePath) || !isImageFile(filePath)) continue
		const storagePath = toStoragePath(filePath, publicDir)
		if (!storagePath.startsWith('/images/') && !storagePath.startsWith('/blogs/')) continue
		const info = await stat(filePath)
		const refs = Array.from(references.get(storagePath) || [])
		const protectedAsset = PROTECTED_ASSETS.has(storagePath)
		const used = protectedAsset || refs.length > 0
		assets.push({
			path: storagePath,
			url: toDisplayUrl(storagePath),
			used,
			protected: protectedAsset,
			deletable: !used && !protectedAsset,
			size: info.size,
			sizeLabel: formatBytes(info.size),
			source: storagePath.startsWith('/blogs/') ? 'blogs' : 'images',
			ext: path.extname(filePath).toLowerCase().replace(/^\./, ''),
			references: refs.sort()
		})
	}

	assets.sort((a, b) => Number(a.used) - Number(b.used) || a.path.localeCompare(b.path))
	return {
		assets,
		summary: {
			total: assets.length,
			used: assets.filter(item => item.used).length,
			unused: assets.filter(item => !item.used).length,
			protected: assets.filter(item => item.protected).length,
			deletable: assets.filter(item => item.deletable).length,
			totalBytes: assets.reduce((sum, item) => sum + item.size, 0),
			unusedBytes: assets.filter(item => item.deletable).reduce((sum, item) => sum + item.size, 0)
		}
	}
}

function resolveDataPublicPath(assetPath: string) {
	const normalized = normalizeAssetReference(assetPath)
	if (!normalized || (!normalized.startsWith('/images/') && !normalized.startsWith('/blogs/'))) throw new Error('非法资源路径')
	const publicDir = path.resolve(getPublicDir())
	const filePath = path.resolve(publicDir, normalized.replace(/^\//, ''))
	if (filePath !== publicDir && !filePath.startsWith(`${publicDir}${path.sep}`)) throw new Error('非法资源路径')
	return { normalized, filePath }
}

export async function deleteUnusedAssets(paths: string[]) {
	await ensureDataSeeded()
	const requested = Array.from(new Set(paths.map(item => String(item || '').trim()).filter(Boolean)))
	const inventory = await getAssetInventory()
	const byPath = new Map(inventory.assets.map(item => [item.path, item]))
	const deleted: string[] = []
	const skipped: Array<{ path: string; reason: string }> = []

	for (const requestedPath of requested) {
		let normalized: string
		let filePath: string
		try {
			const resolved = resolveDataPublicPath(requestedPath)
			normalized = resolved.normalized
			filePath = resolved.filePath
		} catch (error) {
			skipped.push({ path: requestedPath, reason: error instanceof Error ? error.message : '非法资源路径' })
			continue
		}
		const item = byPath.get(normalized)
		if (!item) {
			skipped.push({ path: normalized, reason: '资源不存在或不在可管理范围内' })
			continue
		}
		if (item.protected) {
			skipped.push({ path: normalized, reason: '受保护资源不能删除' })
			continue
		}
		if (item.used) {
			skipped.push({ path: normalized, reason: '资源仍在使用，已跳过' })
			continue
		}
		await rm(filePath, { force: true })
		deleted.push(normalized)
	}

	const nextInventory = await getAssetInventory()
	return { ok: true, deleted, skipped, ...nextInventory }
}
