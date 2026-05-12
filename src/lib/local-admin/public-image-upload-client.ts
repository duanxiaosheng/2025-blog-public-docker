type PublicImageItem = { type: 'url'; url: string } | { type: 'file'; file: File; previewUrl: string }

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

export { assertNoBlobImageUrls } from './blob-guards'
