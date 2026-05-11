import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { requireAdmin } from '@/lib/local-admin/http'
import { savePublicAssetBuffer } from '@/lib/local-admin/storage'
import { hashPassword } from '@/lib/local-admin/auth'

const ALLOWED_SECTIONS = new Set(['project', 'share', 'blogger', 'pictures'])

function normalizeSection(input: string) {
	return String(input || '').trim().toLowerCase()
}

function normalizeFilename(filename: string) {
	const ext = path.extname(filename || '').toLowerCase() || '.png'
	const base = path.basename(filename || 'file', ext).toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'file'
	return `${base}-${hashPassword(`${base}:${Date.now()}:${Math.random()}`).slice(0, 12)}${ext}`
}

export async function POST(req: NextRequest) {
	const unauthorized = await requireAdmin()
	if (unauthorized) return unauthorized

	const formData = await req.formData().catch(() => null)
	const section = normalizeSection(String(formData?.get('section') || ''))
	const file = formData?.get('file')
	if (!ALLOWED_SECTIONS.has(section)) {
		return NextResponse.json({ error: '非法上传分类' }, { status: 400 })
	}
	if (!(file instanceof File)) {
		return NextResponse.json({ error: '缺少文件' }, { status: 400 })
	}

	const filename = normalizeFilename(file.name || 'image.png')
	const buffer = Buffer.from(await file.arrayBuffer())
	const relativePath = `/images/${section}/${filename}`
	await savePublicAssetBuffer(relativePath, buffer)

	return NextResponse.json({ ok: true, path: relativePath })
}
