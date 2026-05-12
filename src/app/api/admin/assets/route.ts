import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/local-admin/http'
import { deleteUnusedAssets, getAssetInventory } from '@/lib/local-admin/asset-inventory'

export async function GET() {
	const unauthorized = await requireAdmin()
	if (unauthorized) return unauthorized
	return NextResponse.json(await getAssetInventory())
}

export async function DELETE(req: NextRequest) {
	const unauthorized = await requireAdmin()
	if (unauthorized) return unauthorized
	const body = await req.json().catch(() => null)
	const paths = Array.isArray(body?.paths) ? body.paths.map((item: unknown) => String(item)) : []
	if (paths.length === 0) return NextResponse.json({ error: '请选择要删除的资源' }, { status: 400 })
	return NextResponse.json(await deleteUnusedAssets(paths))
}
