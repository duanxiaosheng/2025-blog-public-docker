import { NextResponse } from 'next/server'
import { readConfigJson } from '@/lib/local-admin/storage'

export async function GET() {
	const siteContent = await readConfigJson('site-content.json', {})
	const cardStyles = await readConfigJson('card-styles.json', {})
	return NextResponse.json({ siteContent, cardStyles })
}
