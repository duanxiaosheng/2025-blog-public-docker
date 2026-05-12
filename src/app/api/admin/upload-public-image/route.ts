import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/local-admin/http'
import { savePublicAssetBuffer } from '@/lib/local-admin/storage'
import { normalizeAssetFilename, normalizePublicImageSection, publicImageStoragePath } from '@/lib/local-admin/assets'

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'])
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
	const unauthorized = await requireAdmin()
	if (unauthorized) return unauthorized

	const formData = await req.formData().catch(() => null)
	const section = normalizePublicImageSection(String(formData?.get('section') || ''))
	const file = formData?.get('file')
	if (!section) {
		return NextResponse.json({ error: '非法上传分类' }, { status: 400 })
	}
	if (!(file instanceof File)) {
		return NextResponse.json({ error: '缺少文件' }, { status: 400 })
	}
	if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
		return NextResponse.json({ error: '仅支持 png、jpg、jpeg、webp、gif、svg、avif 图片' }, { status: 400 })
	}
	if (file.size <= 0) {
		return NextResponse.json({ error: '图片文件为空' }, { status: 400 })
	}
	if (file.size > MAX_IMAGE_SIZE_BYTES) {
		return NextResponse.json({ error: '图片不能超过 10MB' }, { status: 400 })
	}

	const filename = normalizeAssetFilename(file.name || 'image.png')
	const buffer = Buffer.from(await file.arrayBuffer())
	const relativePath = publicImageStoragePath(section, filename)
	await savePublicAssetBuffer(relativePath, buffer)

	return NextResponse.json({ ok: true, path: relativePath })
}
