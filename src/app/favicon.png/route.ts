import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { ensureDataSeeded, getPublicDir } from '@/lib/local-admin/storage'

const SOURCE_FAVICON = path.join(process.cwd(), 'public', 'favicon.png')

export async function GET() {
	await ensureDataSeeded()
	const dataFavicon = path.join(getPublicDir(), 'images', 'favicon.png')
	try {
		const buffer = await readFile(dataFavicon)
		return new NextResponse(buffer, {
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'no-store, max-age=0'
			}
		})
	} catch {
		const buffer = await readFile(SOURCE_FAVICON)
		return new NextResponse(buffer, {
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'no-store, max-age=0'
			}
		})
	}
}
