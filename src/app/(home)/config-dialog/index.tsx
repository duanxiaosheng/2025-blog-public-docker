'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { DialogModal } from '@/components/dialog-modal'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '../stores/config-store'
import { pushSiteContent } from '../services/push-site-content'
import { refreshSiteAssetVersions, applyFaviconVersion, forceSiteAssetVersions } from '@/hooks/use-site-assets'
import type { SiteContent, CardStyles } from '../stores/config-store'
import { SiteSettings, type FileItem, type ArtImageUploads, type BackgroundImageUploads, type SocialButtonImageUploads } from './site-settings'
import { ColorConfig } from './color-config'
import { HomeLayout } from './home-layout'
import { AdminPasswordDialog } from '@/components/admin-password-dialog'

interface ConfigDialogProps {
	open: boolean
	onClose: () => void
}

type TabType = 'site' | 'color' | 'layout'

export default function ConfigDialog({ open, onClose }: ConfigDialogProps) {
	const { isAuth } = useAuthStore()
	const { siteContent, setSiteContent, cardStyles, setCardStyles, regenerateBubbles, refreshRemoteConfig } = useConfigStore()
	const [formData, setFormData] = useState<SiteContent>(siteContent)
	const [cardStylesData, setCardStylesData] = useState<CardStyles>(cardStyles)
	const [originalData, setOriginalData] = useState<SiteContent>(siteContent)
	const [originalCardStyles, setOriginalCardStyles] = useState<CardStyles>(cardStyles)
	const [isSaving, setIsSaving] = useState(false)
	const [activeTab, setActiveTab] = useState<TabType>('site')
	const [faviconItem, setFaviconItem] = useState<FileItem | null>(null)
	const [avatarItem, setAvatarItem] = useState<FileItem | null>(null)
	const [artImageUploads, setArtImageUploads] = useState<ArtImageUploads>({})
	const [backgroundImageUploads, setBackgroundImageUploads] = useState<BackgroundImageUploads>({})
	const [socialButtonImageUploads, setSocialButtonImageUploads] = useState<SocialButtonImageUploads>({})

	useEffect(() => {
		if (open) {
			const current = { ...siteContent }
			const currentCardStyles = { ...cardStyles }
			setFormData(current)
			setCardStylesData(currentCardStyles)
			setOriginalData(current)
			setOriginalCardStyles(currentCardStyles)
			setFaviconItem(null)
			setAvatarItem(null)
			setArtImageUploads({})
			setBackgroundImageUploads({})
			setSocialButtonImageUploads({})
			setActiveTab('site')
		}
	}, [open, siteContent, cardStyles])

	useEffect(() => {
		return () => {
			if (faviconItem?.type === 'file') URL.revokeObjectURL(faviconItem.previewUrl)
			if (avatarItem?.type === 'file') URL.revokeObjectURL(avatarItem.previewUrl)
			Object.values(artImageUploads).forEach(item => item.type === 'file' && URL.revokeObjectURL(item.previewUrl))
			Object.values(backgroundImageUploads).forEach(item => item.type === 'file' && URL.revokeObjectURL(item.previewUrl))
			Object.values(socialButtonImageUploads).forEach(item => item.type === 'file' && URL.revokeObjectURL(item.previewUrl))
		}
	}, [faviconItem, avatarItem, artImageUploads, backgroundImageUploads, socialButtonImageUploads])

	const handleSaveClick = () => {
		if (!isAuth) {
			toast.info('请先登录管理员密码')
			return
		}
		handleSave()
	}

	const handleSave = async () => {
		setIsSaving(true)
		try {
			const originalArtImages = originalData.artImages ?? []
			const currentArtImages = formData.artImages ?? []
			const removedArtImages = originalArtImages.filter(orig => !currentArtImages.some(current => current.id === orig.id))
			const originalBackgroundImages = originalData.backgroundImages ?? []
			const currentBackgroundImages = formData.backgroundImages ?? []
			const removedBackgroundImages = originalBackgroundImages.filter(orig => !currentBackgroundImages.some(current => current.id === orig.id))

			await pushSiteContent(
				formData,
				cardStylesData,
				faviconItem,
				avatarItem,
				artImageUploads,
				removedArtImages,
				backgroundImageUploads,
				removedBackgroundImages,
				socialButtonImageUploads
			)
			await refreshRemoteConfig()
			if (faviconItem?.type === 'file' || avatarItem?.type === 'file') {
				const versions = await refreshSiteAssetVersions().catch(() => forceSiteAssetVersions())
				if (faviconItem?.type === 'file') applyFaviconVersion(versions.favicon)
			}
			updateThemeVariables(formData.theme)
			setFaviconItem(null)
			setAvatarItem(null)
			setArtImageUploads({})
			setBackgroundImageUploads({})
			setSocialButtonImageUploads({})
			onClose()
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		if (faviconItem?.type === 'file') URL.revokeObjectURL(faviconItem.previewUrl)
		if (avatarItem?.type === 'file') URL.revokeObjectURL(avatarItem.previewUrl)
		Object.values(artImageUploads).forEach(item => item.type === 'file' && URL.revokeObjectURL(item.previewUrl))
		Object.values(backgroundImageUploads).forEach(item => item.type === 'file' && URL.revokeObjectURL(item.previewUrl))
		Object.values(socialButtonImageUploads).forEach(item => item.type === 'file' && URL.revokeObjectURL(item.previewUrl))
		setSiteContent(originalData)
		setCardStyles(originalCardStyles)
		regenerateBubbles()
		if (typeof document !== 'undefined') {
			document.title = originalData.meta.title
			const metaDescription = document.querySelector('meta[name="description"]')
			if (metaDescription) metaDescription.setAttribute('content', originalData.meta.description)
		}
		updateThemeVariables(originalData.theme)
		setFaviconItem(null)
		setAvatarItem(null)
		setArtImageUploads({})
		setBackgroundImageUploads({})
		setSocialButtonImageUploads({})
		onClose()
	}

	const updateThemeVariables = (theme?: SiteContent['theme']) => {
		if (typeof document === 'undefined' || !theme) return
		const { colorBrand, colorBrandSecondary, colorPrimary, colorSecondary, colorBg, colorBorder, colorCard, colorArticle } = theme
		const root = document.documentElement
		if (colorBrand) root.style.setProperty('--color-brand', colorBrand)
		if (colorBrandSecondary) root.style.setProperty('--color-brand-secondary', colorBrandSecondary)
		if (colorPrimary) root.style.setProperty('--color-primary', colorPrimary)
		if (colorSecondary) root.style.setProperty('--color-secondary', colorSecondary)
		if (colorBg) root.style.setProperty('--color-bg', colorBg)
		if (colorBorder) root.style.setProperty('--color-border', colorBorder)
		if (colorCard) root.style.setProperty('--color-card', colorCard)
		if (colorArticle) root.style.setProperty('--color-article', colorArticle)
	}

	const handlePreview = () => {
		setSiteContent(formData)
		setCardStyles(cardStylesData)
		regenerateBubbles()
		if (typeof document !== 'undefined') {
			document.title = formData.meta.title
			const metaDescription = document.querySelector('meta[name="description"]')
			if (metaDescription) metaDescription.setAttribute('content', formData.meta.description)
		}
		updateThemeVariables(formData.theme)
		onClose()
	}

	const syncSiteContentFromRemote = async () => {
		await refreshRemoteConfig()
		const latest = useConfigStore.getState().siteContent
		setFormData({ ...latest })
		setOriginalData({ ...latest })
		setArtImageUploads({})
		setBackgroundImageUploads({})
		setSocialButtonImageUploads({})
		setFaviconItem(null)
		setAvatarItem(null)
	}

	const buttonText = isAuth ? '保存' : '请先登录'
	const tabs: { id: TabType; label: string }[] = [
		{ id: 'site', label: '网站设置' },
		{ id: 'color', label: '色彩配置' },
		{ id: 'layout', label: '首页布局' }
	]

	return (
		<DialogModal open={open} onClose={handleCancel} className='card scrollbar-none max-h-[90vh] min-h-[600px] w-[720px] max-w-[calc(100vw-2rem)] overflow-y-auto'>
			<div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
				<div className='flex flex-wrap gap-1'>
					{tabs.map(tab => (
						<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-brand bg-white/55' : 'text-secondary hover:text-primary'}`}>
							{tab.label}
							{activeTab === tab.id && <div className='bg-brand absolute right-0 bottom-0 left-0 h-0.5' />}
						</button>
					))}
				</div>
				<div className='flex flex-wrap gap-3'>
					<AdminPasswordDialog />
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePreview} className='bg-card rounded-xl border px-6 py-2 text-sm'>预览</motion.button>
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCancel} disabled={isSaving} className='bg-card rounded-xl border px-6 py-2 text-sm'>取消</motion.button>
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveClick} disabled={isSaving} className='brand-btn px-6'>{isSaving ? '保存中...' : buttonText}</motion.button>
				</div>
			</div>
			<div className='min-h-[200px]'>
				{activeTab === 'site' && <SiteSettings formData={formData} setFormData={setFormData} faviconItem={faviconItem} setFaviconItem={setFaviconItem} avatarItem={avatarItem} setAvatarItem={setAvatarItem} artImageUploads={artImageUploads} setArtImageUploads={setArtImageUploads} backgroundImageUploads={backgroundImageUploads} setBackgroundImageUploads={setBackgroundImageUploads} socialButtonImageUploads={socialButtonImageUploads} setSocialButtonImageUploads={setSocialButtonImageUploads} onAssetsChanged={syncSiteContentFromRemote} />}
				{activeTab === 'color' && <ColorConfig formData={formData} setFormData={setFormData} />}
				{activeTab === 'layout' && <HomeLayout cardStylesData={cardStylesData} setCardStylesData={setCardStylesData} onClose={onClose} />}
			</div>
		</DialogModal>
	)
}
