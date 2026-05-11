import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/local-admin/http'
import { deleteBlog, getBlogIndex, saveBlogIndex, saveCategories } from '@/lib/local-admin/storage'

export async function POST(req: NextRequest) {
	const unauthorized = await requireAdmin()
	if (unauthorized) return unauthorized
	const body = await req.json().catch(() => null)
	const originalItems = Array.isArray(body?.originalItems) ? body.originalItems : []
	const items = Array.isArray(body?.items) ? body.items : []
	const categories = Array.isArray(body?.categories) ? body.categories.map((v: unknown) => String(v)) : []
	const currentItems = await getBlogIndex()
	const keep = new Set(items.map((item: any) => String(item.slug || '')))
	for (const item of currentItems) {
		if (item.slug && !keep.has(item.slug)) {
			await deleteBlog(item.slug)
		}
	}
	for (const item of originalItems) {
		const slug = String(item?.slug || '')
		if (slug && !keep.has(slug)) {
			await deleteBlog(slug)
		}
	}
	await saveBlogIndex(items)
	await saveCategories(categories)
	return NextResponse.json({ ok: true })
}
