import { NextResponse } from 'next/server'
import { readConfigJson } from '@/lib/local-admin/storage'
import sourceCardStyles from '@/config/card-styles.json'

export async function GET() {
	const data = await readConfigJson('card-styles.json', sourceCardStyles)
	return NextResponse.json(data)
}
