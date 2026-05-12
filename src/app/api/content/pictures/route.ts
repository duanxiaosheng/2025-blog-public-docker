import { NextResponse } from 'next/server'
import { readContentJson } from '@/lib/local-admin/storage'
import { normalizePublicImagesForDisplay } from '@/lib/local-admin/public-image-paths'

export async function GET() {
	return NextResponse.json(normalizePublicImagesForDisplay(await readContentJson('pictures.json', [])))
}
