import { NextResponse } from 'next/server'
import { readConfigJson } from '@/lib/local-admin/storage'
import { normalizePublicImagesForDisplay } from '@/lib/local-admin/public-image-paths'
import sourceSiteContent from '@/config/site-content.json'

export async function GET() {
	const data = await readConfigJson('site-content.json', sourceSiteContent)
	return NextResponse.json(normalizePublicImagesForDisplay(data))
}
