import { NextRequest, NextResponse } from 'next/server'
import { readContentJson, writeContentJson } from '@/lib/local-admin/storage'

type LikeStore = {
	counts: Record<string, number>
}

const DEFAULT_STORE: LikeStore = { counts: {} }

function normalizeSlug(slug: string) {
	return slug.trim()
}

async function readStore() {
	return readContentJson<LikeStore>('likes.json', DEFAULT_STORE)
}

export async function GET(req: NextRequest) {
	const slug = normalizeSlug(new URL(req.url).searchParams.get('slug') || '')
	if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

	const store = await readStore()
	return NextResponse.json({ count: store.counts[slug] || 0 })
}

export async function POST(req: NextRequest) {
	const slug = normalizeSlug(new URL(req.url).searchParams.get('slug') || '')
	if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

	const store = await readStore()
	const nextCount = (store.counts[slug] || 0) + 1
	store.counts[slug] = nextCount
	await writeContentJson('likes.json', store)

	return NextResponse.json({ count: nextCount })
}
