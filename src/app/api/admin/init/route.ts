import { NextRequest } from 'next/server'
import { initializeAdminFromRequest, getSessionStatus } from '@/lib/local-admin/http'

export async function GET() {
	return getSessionStatus()
}

export async function POST(req: NextRequest) {
	return initializeAdminFromRequest(req)
}
