import { toast } from 'sonner'
import type { Blogger } from '../grid-view'
import type { AvatarItem } from '../components/avatar-upload-dialog'

export type PushBloggersParams = {
	bloggers: Blogger[]
	avatarItems?: Map<string, AvatarItem>
}

async function uploadAvatar(section: string, item: AvatarItem) {
	if (item.type === 'url') return item.url
	const formData = new FormData()
	formData.append('section', section)
	formData.append('file', item.file)
	const res = await fetch('/api/admin/upload-public-image', { method: 'POST', body: formData })
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || '博客头像上传失败')
	}
	const body = await res.json().catch(() => null)
	return String(body?.path || '')
}

export async function pushBloggers(params: PushBloggersParams): Promise<void> {
	const nextBloggers = await Promise.all(
		params.bloggers.map(async blogger => {
			const item = params.avatarItems?.get(blogger.url)
			if (!item) return blogger
			const avatar = await uploadAvatar('blogger', item)
			return { ...blogger, avatar }
		})
	)

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
