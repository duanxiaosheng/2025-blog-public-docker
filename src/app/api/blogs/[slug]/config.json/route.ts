import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { ensureDataSeeded, getPublicDir } from '@/lib/local-admin/storage'

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
	await ensureDataSeeded()
	const { slug } = await context.params
	const filePath = path.join(getPublicDir(), 'blogs', slug, 'config.json')
	try {
		const buffer = await readFile(filePath)
		return new NextResponse(buffer, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Cache-Control': 'no-store'
			}
		})
	} catch {
		return NextResponse.json({ error: 'Not found' }, { status: 404 })
	}
}
