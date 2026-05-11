import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/local-admin/http'
import { deleteBlog, getBlogIndex, saveBlogIndex } from '@/lib/local-admin/storage'

export async function DELETE(_: Request, context: { params: Promise<{ slug: string }> }) {
	const unauthorized = await requireAdmin()
	if (unauthorized) return unauthorized

	const { slug } = await context.params
	await deleteBlog(slug)
	const items = await getBlogIndex()
	await saveBlogIndex(items.filter(item => item.slug !== slug))
	return NextResponse.json({ ok: true })
}
