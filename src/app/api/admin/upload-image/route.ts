import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/local-admin/http'
import { savePublicAssetBuffer } from '@/lib/local-admin/storage'

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'])
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

function normalizeSlug(input: string) {
	return String(input || '')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9-_]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
}

function normalizeFilename(input: string) {
	const cleaned = String(input || '')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9._-]/g, '-')
		.replace(/-+/g, '-')
	return cleaned.replace(/^\.+/, '')
}

export async function POST(req: NextRequest) {
	const unauthorized = await requireAdmin()
	if (unauthorized) return unauthorized

	const formData = await req.formData().catch(() => null)
	const slug = normalizeSlug(String(formData?.get('slug') || ''))
	const filename = normalizeFilename(String(formData?.get('filename') || ''))
	const file = formData?.get('file')

	if (!slug) {
		return NextResponse.json({ error: 'slug 不能为空' }, { status: 400 })
	}

	if (!filename) {
		return NextResponse.json({ error: '文件名不能为空' }, { status: 400 })
	}

	if (!(file instanceof File)) {
		return NextResponse.json({ error: '缺少图片文件' }, { status: 400 })
	}

	if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
		return NextResponse.json({ error: '仅支持 png、jpg、jpeg、webp、gif、svg 图片' }, { status: 400 })
	}

	if (file.size <= 0) {
		return NextResponse.json({ error: '图片文件为空' }, { status: 400 })
	}

	if (file.size > MAX_IMAGE_SIZE_BYTES) {
		return NextResponse.json({ error: '图片不能超过 10MB' }, { status: 400 })
	}

	const arrayBuffer = await file.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)
	const relativePath = `blogs/${slug}/${filename}`
	await savePublicAssetBuffer(relativePath, buffer)

	return NextResponse.json({
		ok: true,
		path: `/blogs/${slug}/${filename}`
	})
}
