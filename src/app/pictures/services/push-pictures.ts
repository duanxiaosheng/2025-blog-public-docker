import { toast } from 'sonner'
import { Picture } from '../page'
import type { ImageItem } from '../../projects/components/image-upload-dialog'

export type PushPicturesParams = {
	pictures: Picture[]
	imageItems?: Map<string, ImageItem>
}

async function uploadImage(section: string, item: ImageItem) {
	if (item.type === 'url') return item.url
	const formData = new FormData()
	formData.append('section', section)
	formData.append('file', item.file)
	const res = await fetch('/api/admin/upload-public-image', { method: 'POST', body: formData })
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || '图片集上传失败')
	}
	const body = await res.json().catch(() => null)
	return String(body?.path || '')
}

export async function pushPictures(params: PushPicturesParams): Promise<void> {
	const nextPictures = await Promise.all(
		params.pictures.map(async picture => {
			const next = { ...picture }
			if (picture.image) {
				const singleKey = `${picture.id}::single`
				const singleItem = params.imageItems?.get(singleKey)
				if (singleItem) next.image = await uploadImage('pictures', singleItem)
			}
			if (picture.images?.length) {
				next.images = await Promise.all(
					picture.images.map(async (url, index) => {
						const item = params.imageItems?.get(`${picture.id}::${index}`)
						if (!item) return url
						return uploadImage('pictures', item)
					})
				)
			}
			return next
		})
	)

	const res = await fetch('/api/admin/pictures', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ pictures: nextPictures })
	})
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || '保存失败')
	}
	toast.success('发布成功！')
}
