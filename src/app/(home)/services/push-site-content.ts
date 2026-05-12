import { toast } from 'sonner'
import { fileToBase64NoPrefix } from '@/lib/file-utils'
import type { SiteContent, CardStyles } from '../stores/config-store'
import type { FileItem, ArtImageUploads, SocialButtonImageUploads, BackgroundImageUploads } from '../config-dialog/site-settings'

type ArtImageConfig = SiteContent['artImages'][number]
type BackgroundImageConfig = SiteContent['backgroundImages'][number]

function toStoragePath(url: string) {
	if (!url) return url
	if (url.startsWith('/api/images/')) return url.replace('/api/images/', '/images/')
	return url
}

function toStoredSiteContent(siteContent: SiteContent): SiteContent {
	return {
		...siteContent,
		artImages: (siteContent.artImages || []).map(item => ({
			...item,
			url: toStoragePath(item.url)
		})),
		backgroundImages: (siteContent.backgroundImages || []).map(item => ({
			...item,
			url: toStoragePath(item.url)
		})),
		socialButtons: (siteContent.socialButtons || []).map(item => ({
			...item,
			value: typeof item.value === 'string' ? toStoragePath(item.value) : item.value
		}))
	}
}

export async function pushSiteContent(
	siteContent: SiteContent,
	cardStyles: CardStyles,
	faviconItem?: FileItem | null,
	avatarItem?: FileItem | null,
	artImageUploads?: ArtImageUploads,
	removedArtImages?: ArtImageConfig[],
	backgroundImageUploads?: BackgroundImageUploads,
	removedBackgroundImages?: BackgroundImageConfig[],
	socialButtonImageUploads?: SocialButtonImageUploads
): Promise<void> {
	const storedSiteContent = toStoredSiteContent(siteContent)
	const uploads: Array<{ relativePath: string; contentBase64: string }> = []
	const removals: string[] = []

	if (faviconItem?.type === 'file') {
		uploads.push({ relativePath: '/images/favicon.png', contentBase64: await fileToBase64NoPrefix(faviconItem.file) })
	}
	if (avatarItem?.type === 'file') {
		uploads.push({ relativePath: '/images/avatar.png', contentBase64: await fileToBase64NoPrefix(avatarItem.file) })
	}

	if (artImageUploads) {
		for (const [id, item] of Object.entries(artImageUploads)) {
			if (item.type !== 'file') continue
			const artConfig = storedSiteContent.artImages?.find(art => art.id === id)
			if (!artConfig?.url) continue
			uploads.push({ relativePath: artConfig.url, contentBase64: await fileToBase64NoPrefix(item.file) })
		}
	}
	if (removedArtImages?.length) {
		for (const art of removedArtImages) removals.push(toStoragePath(art.url))
	}

	if (backgroundImageUploads) {
		for (const [id, item] of Object.entries(backgroundImageUploads)) {
			if (item.type !== 'file') continue
			const bgConfig = storedSiteContent.backgroundImages?.find(bg => bg.id === id)
			if (!bgConfig?.url?.startsWith('/images/background/')) continue
			uploads.push({ relativePath: bgConfig.url, contentBase64: await fileToBase64NoPrefix(item.file) })
		}
	}
	if (removedBackgroundImages?.length) {
		for (const bg of removedBackgroundImages) {
			const storagePath = toStoragePath(bg.url)
			if (storagePath.startsWith('/images/background/')) removals.push(storagePath)
		}
	}

	if (socialButtonImageUploads) {
		for (const [buttonId, item] of Object.entries(socialButtonImageUploads)) {
			if (item.type !== 'file') continue
			const button = storedSiteContent.socialButtons?.find(btn => btn.id === buttonId)
			if (!button?.value?.startsWith('/images/social-buttons/')) continue
			uploads.push({ relativePath: button.value, contentBase64: await fileToBase64NoPrefix(item.file) })
		}
	}

	const res = await fetch('/api/admin/config', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ siteContent: storedSiteContent, cardStyles, uploads, removals })
	})
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || '保存失败')
	}
	toast.success('保存成功！')
}
