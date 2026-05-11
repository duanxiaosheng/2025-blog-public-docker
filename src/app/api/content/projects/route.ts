import { NextResponse } from 'next/server'
import { readContentJson } from '@/lib/local-admin/storage'

export async function GET() {
	return NextResponse.json(await readContentJson('projects.json', []))
}
