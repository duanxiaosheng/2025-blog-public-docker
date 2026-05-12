type PublicImageItem = { type: 'url'; url: string } | { type: 'file'; file: File; previewUrl: string }

function isBlobUrl(value: unknown) {
	return typeof value === 'string' && value.startsWith('blob:')
}

export async function uploadPublicImage(section: string, item: PublicImageItem, errorMessage: string) {
	if (item.type === 'url') return item.url
	const formData = new FormData()
	formData.append('section', section)
	formData.append('file', item.file)
	const res = await fetch('/api/admin/upload-public-image', { method: 'POST', body: formData })
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || errorMessage)
	}
	const body = await res.json().catch(() => null)
	return String(body?.path || '')
}

export function assertNoBlobImageUrls(items: unknown[], fields: string[], message = '有图片还只是临时预览地址，请重新选择图片后再保存') {
	for (const item of items as Array<Record<string, unknown>>) {
		for (const field of fields) {
			const value = item?.[field]
			if (isBlobUrl(value)) throw new Error(message)
			if (Array.isArray(value) && value.some(isBlobUrl)) throw new Error(message)
		}
	}
}
