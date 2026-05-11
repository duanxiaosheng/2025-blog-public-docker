import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { ensureDataSeeded, getPublicDir } from '@/lib/local-admin/storage'

function getContentType(filePath: string) {
	const ext = path.extname(filePath).toLowerCase()
	switch (ext) {
		case '.json':
			return 'application/json; charset=utf-8'
		case '.md':
			return 'text/markdown; charset=utf-8'
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
		default:
			return 'application/octet-stream'
	}
}

export async function GET(_: Request, context: { params: Promise<{ path: string[] }> }) {
	await ensureDataSeeded()
	const { path: rawParts } = await context.params
	const parts = rawParts[0] === 'blogs' ? rawParts.slice(1) : rawParts
	const filePath = path.join(getPublicDir(), 'blogs', ...parts)
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
