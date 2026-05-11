import { toast } from 'sonner'
import type { Share } from '../components/share-card'
import type { LogoItem } from '../components/logo-upload-dialog'

export type PushSharesParams = {
	shares: Share[]
	logoItems?: Map<string, LogoItem>
}

export async function pushShares(params: PushSharesParams): Promise<void> {
	const res = await fetch('/api/admin/share', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ shares: params.shares })
	})
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || '保存失败')
	}
	toast.success('发布成功！')
}
