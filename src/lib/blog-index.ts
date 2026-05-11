import type { BlogIndexItem } from '@/app/blog/types'

export type { BlogIndexItem } from '@/app/blog/types'

async function getIndex(): Promise<BlogIndexItem[]> {
	const res = await fetch('/api/blogs/index.json', { cache: 'no-store' })
	if (!res.ok) return []
	return res.json()
}

export async function prepareBlogsIndex(item: BlogIndexItem): Promise<string> {
	const list = await getIndex()
	const map = new Map<string, BlogIndexItem>(list.map(i => [i.slug, i]))
	map.set(item.slug, item)
	const next = Array.from(map.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
	return JSON.stringify(next, null, 2)
}

export async function removeBlogsFromIndex(slugs: string[]): Promise<string> {
	const list = await getIndex()
	const slugSet = new Set(slugs.filter(Boolean))
	if (slugSet.size === 0) return JSON.stringify(list, null, 2)
	const next = list.filter(item => !slugSet.has(item.slug))
	return JSON.stringify(next, null, 2)
}

export async function removeBlogFromIndex(slug: string): Promise<string> {
	return removeBlogsFromIndex([slug])
}
