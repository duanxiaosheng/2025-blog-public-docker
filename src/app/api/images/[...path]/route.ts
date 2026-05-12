import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { ensureDataSeeded, getPublicDir } from '@/lib/local-admin/storage'
import { readSiteAsset } from '@/lib/local-admin/site-assets'

const SOURCE_PUBLIC_DIR = path.join(process.cwd(), 'public')

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

export async function GET(_: Request, context: { params: Promise<{ path: string[] }> }) {
	await ensureDataSeeded()
	const { path: parts } = await context.params
	if (parts.length === 1 && (parts[0] === 'avatar.png' || parts[0] === 'favicon.png')) {
		const kind = parts[0] === 'avatar.png' ? 'avatar' : 'favicon'
		const { buffer, contentType, version } = await readSiteAsset(kind)
		return new NextResponse(buffer, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
				Pragma: 'no-cache',
				Expires: '0',
				ETag: `"${version}"`
			}
		})
	}
	const dataFilePath = path.join(getPublicDir(), 'images', ...parts)
	const sourceFilePath = path.join(SOURCE_PUBLIC_DIR, 'images', ...parts)
	try {
		const buffer = await readFile(dataFilePath)
		return new NextResponse(buffer, {
			headers: {
				'Content-Type': getContentType(dataFilePath),
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		})
	} catch {
		try {
			const buffer = await readFile(sourceFilePath)
			return new NextResponse(buffer, {
				headers: {
					'Content-Type': getContentType(sourceFilePath),
					'Cache-Control': 'public, max-age=31536000, immutable'
				}
			})
		} catch {
			return NextResponse.json({ error: 'Not found' }, { status: 404 })
		}
	}
}
