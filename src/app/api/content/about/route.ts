import { NextResponse } from 'next/server'
import { readContentJson } from '@/lib/local-admin/storage'

export async function GET() {
	const data = await readContentJson('about.json', { title: '', description: '', content: '' })
	return NextResponse.json(data)
}
