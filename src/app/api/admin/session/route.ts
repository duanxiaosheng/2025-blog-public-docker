import { getSessionStatus } from '@/lib/local-admin/http'

export async function GET() {
	return getSessionStatus()
}
