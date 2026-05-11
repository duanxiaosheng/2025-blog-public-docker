import { hashFileSHA256 } from '@/lib/file-utils'
import type { ImageItem } from '../types'
import { getFileExt } from '@/lib/utils'
import { toast } from 'sonner'
import { formatDateTimeLocal } from '../stores/write-store'

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

export type PushBlogParams = {
	form: {
		slug: string
		title: string
		md: string
		tags: string[]
		date?: string
		summary?: string
		hidden?: boolean
		category?: string
	}
	cover?: ImageItem | null
	images?: ImageItem[]
	mode?: 'create' | 'edit'
	originalSlug?: string | null
}

function normalizePublishedAssetPath(url: string, slug: string, originalSlug?: string | null) {
	if (!url) return url

	let normalized = url.trim()
	while (normalized.startsWith('/api/api/')) {
		normalized = normalized.replace('/api/api/', '/api/')
	}

	const filenameOnly = normalized.match(/^\/(?:api\/)?blogs\/([^/]+\.[a-z0-9]+)$/i)
	if (filenameOnly) {
		return `/blogs/${encodeURIComponent(slug)}/${filenameOnly[1]}`
	}

	const candidates = [slug, originalSlug].filter(Boolean) as string[]
	for (const current of candidates) {
		const encoded = encodeURIComponent(current)
		if (normalized.startsWith(`/api/blogs/${encoded}/`)) return normalized.replace(`/api/blogs/${encoded}/`, `/blogs/${encodeURIComponent(slug)}/`)
		if (normalized.startsWith(`/api/blogs/${current}/`)) return normalized.replace(`/api/blogs/${current}/`, `/blogs/${slug}/`)
		if (normalized.startsWith(`/blogs/${encoded}/`)) return normalized.replace(`/blogs/${encoded}/`, `/blogs/${encodeURIComponent(slug)}/`)
		if (normalized.startsWith(`/blogs/${current}/`)) return normalized.replace(`/blogs/${current}/`, `/blogs/${slug}/`)
	}

	return normalized
}

async function uploadImageAsset(params: { slug: string; filename: string; file: File }): Promise<string> {
	const formData = new FormData()
	formData.append('slug', params.slug)
	formData.append('filename', params.filename)
	formData.append('file', params.file)

	const response = await fetch('/api/admin/upload-image', {
		method: 'POST',
		body: formData
	})

	if (!response.ok) {
		const data = await response.json().catch(() => null)
		throw new Error(data?.error || '图片上传失败')
	}

	const data = await response.json().catch(() => null)
	return String(data?.path || `/blogs/${params.slug}/${params.filename}`)
}

export async function pushBlog(params: PushBlogParams): Promise<void> {
	const { form, cover, images, mode = 'create', originalSlug } = params

	if (!form?.slug) throw new Error('需要 slug')

	toast.info('正在准备本地文件...')

	const allLocalImages: Array<{ img: Extract<ImageItem, { type: 'file' }>; id: string }> = []
	for (const img of images || []) {
		if (img.type === 'file') allLocalImages.push({ img, id: img.id })
	}
	if (cover?.type === 'file') {
		allLocalImages.push({ img: cover, id: cover.id })
	}

	const oversizeImage = allLocalImages.find(({ img }) => img.file.size > MAX_IMAGE_SIZE_BYTES)
	if (oversizeImage) {
		throw new Error('单张图片不能超过 10MB')
	}

	const uploadedHashes = new Map<string, string>()
	let mdToUpload = form.md
	let coverPath: string | undefined

	for (const img of images || []) {
		if (img.type === 'url') {
			mdToUpload = mdToUpload.split(`(${img.url})`).join(`(${normalizePublishedAssetPath(img.url, form.slug, originalSlug)})`)
		}
	}

	if (allLocalImages.length > 0) {
		toast.info('正在上传图片...')
		for (const { img, id } of allLocalImages) {
			const hash = img.hash || (await hashFileSHA256(img.file))
			const ext = getFileExt(img.file.name)
			const filename = `${hash}${ext}`

			let publicPath = uploadedHashes.get(hash)
			if (!publicPath) {
				publicPath = await uploadImageAsset({
					slug: form.slug,
					filename,
					file: img.file
				})
				uploadedHashes.set(hash, publicPath)
			}

			const placeholder = `local-image:${id}`
			mdToUpload = mdToUpload.split(`(${placeholder})`).join(`(${publicPath})`)

			if (cover?.type === 'file' && cover.id === id) {
				coverPath = publicPath
			}
		}
	}

	if (cover?.type === 'url') {
		coverPath = normalizePublishedAssetPath(cover.url, form.slug, originalSlug)
	}

	const dateStr = form.date || formatDateTimeLocal()
	const response = await fetch('/api/admin/blogs', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			form: {
				...form,
				md: mdToUpload,
				date: dateStr
			},
			mode,
			originalSlug,
			coverPath
		})
	})

	if (!response.ok) {
		const data = await response.json().catch(() => null)
		throw new Error(data?.error || '保存失败')
	}

	toast.success(mode === 'edit' ? '更新成功' : '发布成功')
}
