import type { BlogConfig } from '@/app/blog/types'

export type { BlogConfig } from '@/app/blog/types'

export type LoadedBlog = {
	slug: string
	config: BlogConfig
	markdown: string
	cover?: string
}

function normalizeBlogAssetUrl(value?: string, slug?: string) {
	if (!value) return value
	let normalized = value
	while (normalized.includes('/api/api/')) {
		normalized = normalized.replaceAll('/api/api/', '/api/')
	}
	if (slug) {
		normalized = normalized.replaceAll(`/blogs/${encodeURIComponent(slug)}/`, `/api/blogs/${encodeURIComponent(slug)}/`)
		normalized = normalized.replaceAll(`/blogs/${slug}/`, `/api/blogs/${slug}/`)
	}
	return normalized
}

/**
 * Load blog data from public/blogs/{slug}
 * Used by both view page and edit page
 */
export async function loadBlog(slug: string): Promise<LoadedBlog> {
	if (!slug) {
		throw new Error('Slug is required')
	}

	// Load config.json
	let config: BlogConfig = {}
	const configRes = await fetch(`/api/blogs/${encodeURIComponent(slug)}/config.json`, { cache: 'no-store' })
	if (configRes.ok) {
		try {
			config = await configRes.json()
		} catch {
			config = {}
		}
	}

	// Load index.md
	const mdRes = await fetch(`/api/blogs/${encodeURIComponent(slug)}/index.md`, { cache: 'no-store' })
	if (!mdRes.ok) {
		throw new Error('Blog not found')
	}
	const markdown = await mdRes.text()
	const normalizedMarkdown = normalizeBlogAssetUrl(markdown, slug) || markdown
	const normalizedCover = normalizeBlogAssetUrl(config.cover, slug)

	return {
		slug,
		config,
		markdown: normalizedMarkdown,
		cover: normalizedCover
	}
}
