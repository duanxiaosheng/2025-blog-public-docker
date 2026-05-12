import { toast } from 'sonner'
import type { Share } from '../components/share-card'
import type { LogoItem } from '../components/logo-upload-dialog'
import { assertNoBlobImageUrls, uploadPublicImage } from '@/lib/local-admin/public-image-upload-client'

export type PushSharesParams = {
	shares: Share[]
	logoItems?: Map<string, LogoItem>
}

export async function prepareSharesForSave(params: PushSharesParams): Promise<Share[]> {
	const nextShares = await Promise.all(
		params.shares.map(async share => {
			const item = params.logoItems?.get(share.url)
			if (!item) return share
			const logo = await uploadPublicImage('share', item, '推荐分享图片上传失败')
			return { ...share, logo }
		})
	)
	assertNoBlobImageUrls(nextShares, ['logo'])
	return nextShares
}

export async function pushShares(params: PushSharesParams): Promise<Share[]> {
	const nextShares = await prepareSharesForSave(params)

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
	return nextShares
}
