import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { ensureDataSeeded, getPublicDir } from '@/lib/local-admin/storage'

function getContentType(filePath: string) {
	const ext = path.extname(filePath).toLowerCase()
	switch (ext) {
		case '.png':
			return 'image/png'
		case '.jpg':
		case '.jpeg':
			return 'image/jpeg'
		case '.webp':
			return 'image/webp'
		case '.gif':
			return 'image/gif'
		case '.svg':
			return 'image/svg+xml'
		case '.avif':
			return 'image/avif'
		default:
			return 'application/octet-stream'
	}
}

export async function GET(_: Request, context: { params: Promise<{ slug: string; asset: string }> }) {
	await ensureDataSeeded()
	const { slug, asset } = await context.params
	const filePath = path.join(getPublicDir(), 'blogs', slug, asset)
	try {
		const buffer = await readFile(filePath)
		return new NextResponse(buffer, {
			headers: {
				'Content-Type': getContentType(filePath),
				'Cache-Control': 'no-store'
			}
		})
	} catch {
		return NextResponse.json({ error: 'Not found' }, { status: 404 })
	}
}
