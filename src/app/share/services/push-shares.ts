import { toast } from 'sonner'
import type { Share } from '../components/share-card'
import type { LogoItem } from '../components/logo-upload-dialog'

export type PushSharesParams = {
	shares: Share[]
	logoItems?: Map<string, LogoItem>
}

async function uploadLogo(section: string, item: LogoItem) {
	if (item.type === 'url') return item.url
	const formData = new FormData()
	formData.append('section', section)
	formData.append('file', item.file)
	const res = await fetch('/api/admin/upload-public-image', { method: 'POST', body: formData })
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || '推荐分享图片上传失败')
	}
	const body = await res.json().catch(() => null)
	return String(body?.path || '')
}

export async function pushShares(params: PushSharesParams): Promise<void> {
	const nextShares = await Promise.all(
		params.shares.map(async share => {
			const item = params.logoItems?.get(share.url)
			if (!item) return share
			const logo = await uploadLogo('share', item)
			return { ...share, logo }
		})
	)

	const res = await fetch('/api/admin/share', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ shares: nextShares })
	})
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || '保存失败')
	}
	toast.success('发布成功！')
}
