import { toast } from 'sonner'
import type { Blogger } from '../grid-view'
import type { AvatarItem } from '../components/avatar-upload-dialog'
import { assertNoBlobImageUrls, uploadPublicImage } from '@/lib/local-admin/public-image-upload-client'

export type PushBloggersParams = {
	bloggers: Blogger[]
	avatarItems?: Map<string, AvatarItem>
}

export async function pushBloggers(params: PushBloggersParams): Promise<void> {
	const nextBloggers = await Promise.all(
		params.bloggers.map(async blogger => {
			const item = params.avatarItems?.get(blogger.url)
			if (!item) return blogger
			const avatar = await uploadPublicImage('blogger', item, '博客头像上传失败')
			return { ...blogger, avatar }
		})
	)
	assertNoBlobImageUrls(nextBloggers, ['avatar'])

	const res = await fetch('/api/admin/bloggers', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ bloggers: nextBloggers })
	})
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || '保存失败')
	}
	toast.success('发布成功！')
}
