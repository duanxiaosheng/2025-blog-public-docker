import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/local-admin/http'
import { deleteBlog, getBlogIndex, getCategories, saveBlog, saveBlogIndex, saveCategories, type BlogConfig, type BlogIndexItem } from '@/lib/local-admin/storage'

function normalizeSlug(input: string) {
	return String(input || '')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9-_]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
}

export async function POST(req: NextRequest) {
	const unauthorized = await requireAdmin()
	if (unauthorized) return unauthorized

	const body = await req.json().catch(() => null)
	const form = body?.form || {}
	const slug = normalizeSlug(String(form.slug || ''))
	if (!slug) {
		return NextResponse.json({ error: 'slug 不能为空' }, { status: 400 })
	}

	const originalSlug = body?.originalSlug ? normalizeSlug(String(body.originalSlug)) : null
	const config: BlogConfig = {
		title: String(form.title || ''),
		date: String(form.date || ''),
		tags: Array.isArray(form.tags) ? form.tags.map((v: unknown) => String(v)) : [],
		summary: String(form.summary || ''),
		hidden: !!form.hidden,
		category: form.category ? String(form.category) : '',
		cover: body?.coverPath ? String(body.coverPath) : undefined
	}

	await saveBlog({
		slug,
		originalSlug,
		config,
		markdown: String(form.md || '')
	})

	const currentIndex = await getBlogIndex()
	const nextItem: BlogIndexItem = {
		slug,
		title: config.title || '',
		tags: config.tags || [],
		date: config.date || '',
		summary: config.summary || '',
		cover: config.cover,
		hidden: !!config.hidden,
		category: config.category || ''
	}
	const filtered = currentIndex.filter(item => item.slug !== slug && item.slug !== originalSlug)
	filtered.push(nextItem)
	filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	await saveBlogIndex(filtered)

	const currentCategories = await getCategories()
	const categorySet = new Set((currentCategories.categories || []).map(item => item.trim()).filter(Boolean))
	if (config.category?.trim()) categorySet.add(config.category.trim())
	await saveCategories(Array.from(categorySet))

	if (originalSlug && originalSlug !== slug) {
		await deleteBlog(originalSlug)
	}

	return NextResponse.json({ ok: true, slug })
}
