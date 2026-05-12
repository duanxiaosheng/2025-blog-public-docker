import { NextResponse } from 'next/server'
import { getSiteAssetVersion } from '@/lib/local-admin/site-assets'

export async function GET() {
	const [avatar, favicon] = await Promise.all([getSiteAssetVersion('avatar'), getSiteAssetVersion('favicon')])
	return NextResponse.json(
		{ avatar, favicon },
		{
			headers: {
				'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
				Pragma: 'no-cache',
				Expires: '0'
			}
		}
	)
}
