import { toast } from 'sonner'
import { Picture } from '../page'
import type { ImageItem } from '../../projects/components/image-upload-dialog'

export type PushPicturesParams = {
	pictures: Picture[]
	imageItems?: Map<string, ImageItem>
}

export async function pushPictures(params: PushPicturesParams): Promise<void> {
	const res = await fetch('/api/admin/pictures', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ pictures: params.pictures })
	})
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || '保存失败')
	}
	toast.success('发布成功！')
}
