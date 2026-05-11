import { NextRequest } from 'next/server'
import { loginFromRequest } from '@/lib/local-admin/http'

export async function POST(req: NextRequest) {
	return loginFromRequest(req)
}
