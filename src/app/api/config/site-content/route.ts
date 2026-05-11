import { NextResponse } from 'next/server'
import { readConfigJson } from '@/lib/local-admin/storage'
import sourceSiteContent from '@/config/site-content.json'

function normalizeImageUrl(url: string) {
	if (!url) return url
	if (url.startsWith('/images/')) return `/api${url}`
	return url
}

function normalizeSiteContent(data: any) {
	const next = { ...(data || {}) }
	if (Array.isArray(next.artImages)) {
		next.artImages = next.artImages.map((item: any) => ({
			...item,
			url: normalizeImageUrl(String(item?.url || ''))
		}))
	}
	if (Array.isArray(next.backgroundImages)) {
		next.backgroundImages = next.backgroundImages.map((item: any) => ({
			...item,
			url: normalizeImageUrl(String(item?.url || ''))
		}))
	}
	if (Array.isArray(next.socialButtons)) {
		next.socialButtons = next.socialButtons.map((item: any) => ({
			...item,
			value: typeof item?.value === 'string' ? normalizeImageUrl(item.value) : item?.value
		}))
	}
	return next
}

export async function GET() {
	const data = await readConfigJson('site-content.json', sourceSiteContent)
	return NextResponse.json(normalizeSiteContent(data))
}
