import { toast } from 'sonner'
import { Picture } from '../page'
import type { ImageItem } from '../../projects/components/image-upload-dialog'
import { assertNoBlobImageUrls, uploadPublicImage } from '@/lib/local-admin/public-image-upload-client'

export type PushPicturesParams = {
	pictures: Picture[]
	imageItems?: Map<string, ImageItem>
}

export async function pushPictures(params: PushPicturesParams): Promise<void> {
	const nextPictures = await Promise.all(
		params.pictures.map(async picture => {
			const next = { ...picture }
			if (picture.image) {
				const singleKey = `${picture.id}::single`
				const singleItem = params.imageItems?.get(singleKey)
				if (singleItem) next.image = await uploadPublicImage('pictures', singleItem, '图片集上传失败')
			}
			if (picture.images?.length) {
				next.images = await Promise.all(
					picture.images.map(async (url, index) => {
						const item = params.imageItems?.get(`${picture.id}::${index}`)
						if (!item) return url
						return uploadPublicImage('pictures', item, '图片集上传失败')
					})
				)
			}
			return next
		})
	)
	assertNoBlobImageUrls(nextPictures, ['image', 'images'])

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
