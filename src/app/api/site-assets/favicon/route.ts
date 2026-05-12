import { NextResponse } from 'next/server'
import { readSiteAsset } from '@/lib/local-admin/site-assets'

export async function GET() {
	const { buffer, contentType, version } = await readSiteAsset('favicon')
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
