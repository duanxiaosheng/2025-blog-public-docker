'use client'

import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import IconUploadDialog, { type IconItem } from './icon-upload-dialog'

function normalizePublicImageUrl(url: string) {
	if (!url) return url
	let normalized = url.trim()
	while (normalized.includes('/api/api/')) normalized = normalized.replaceAll('/api/api/', '/api/')
	if (normalized.startsWith('/images/')) normalized = normalized.replace('/images/', '/api/images/')
	return normalized
}

export interface AppLink {
	name: string
	icon: string
	url: string
	visible?: boolean
}

interface AppCardProps {
	app: AppLink
	isEditMode?: boolean
	onUpdate?: (app: AppLink, oldApp: AppLink, iconItem?: IconItem) => void
	onDelete?: () => void
}

export function AppCard({ app, isEditMode = false, onUpdate, onDelete }: AppCardProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [localApp, setLocalApp] = useState(app)
	const [showIconDialog, setShowIconDialog] = useState(false)
	const [iconItem, setIconItem] = useState<IconItem | null>(null)
	const displayIconUrl = useMemo(() => normalizePublicImageUrl(localApp.icon), [localApp.icon])
	const canEdit = isEditMode && isEditing
	const visible = localApp.visible !== false

	const handleFieldChange = (field: keyof AppLink, value: any) => {
		const updated = { ...localApp, [field]: value }
		setLocalApp(updated)
		onUpdate?.(updated, app, iconItem || undefined)
	}

	const handleIconSubmit = (icon: IconItem) => {
		setIconItem(icon)
		const iconUrl = icon.type === 'url' ? icon.url : icon.previewUrl
		const updated = { ...localApp, icon: iconUrl }
		setLocalApp(updated)
		onUpdate?.(updated, app, icon)
	}

	const handleCancel = () => {
		setLocalApp(app)
		setIconItem(null)
		setIsEditing(false)
	}

	const content = (
		<motion.div
			initial={{ opacity: 0, y: 10, scale: 0.96 }}
			animate={{ opacity: visible ? 1 : 0.45, y: 0, scale: 1 }}
			whileHover={!canEdit ? { y: -4, scale: 1.03 } : undefined}
			className={cn('group relative flex flex-col items-center gap-2 rounded-3xl p-3 transition', !visible && 'opacity-50')}>
			{isEditMode && (
				<div className='absolute -top-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full border bg-white/90 px-2 py-1 text-xs shadow-sm backdrop-blur-xl'>
					{isEditing ? (
						<>
							<button type='button' onClick={handleCancel} className='text-gray-400 hover:text-gray-600'>取消</button>
							<button type='button' onClick={() => setIsEditing(false)} className='text-blue-400 hover:text-blue-600'>完成</button>
						</>
					) : (
						<>
							<button type='button' onClick={() => setIsEditing(true)} className='text-blue-400 hover:text-blue-600'>编辑</button>
							<button type='button' onClick={onDelete} className='text-red-400 hover:text-red-600'>删除</button>
						</>
					)}
				</div>
			)}

			<div
				className={cn(
					'bg-card/80 relative flex h-18 w-18 items-center justify-center overflow-hidden rounded-3xl border border-white/70 shadow-sm backdrop-blur-xl transition-all group-hover:shadow-md sm:h-20 sm:w-20',
					canEdit && 'cursor-pointer ring-2 ring-brand/20'
				)}
				onClick={event => {
					if (!canEdit) return
					event.preventDefault()
					setShowIconDialog(true)
				}}>
				{displayIconUrl ? (
					<img src={displayIconUrl} alt={localApp.name} className='h-12 w-12 rounded-2xl object-cover sm:h-14 sm:w-14' />
				) : (
					<div className='text-secondary flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-xs'>图标</div>
				)}
				{canEdit && <div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>更换</div>}
			</div>

			{canEdit ? (
				<div className='w-full space-y-1'>
					<input
						value={localApp.name}
						onChange={e => handleFieldChange('name', e.target.value)}
						placeholder='应用名称'
						className='w-full rounded-lg bg-white/80 px-2 py-1 text-center text-xs outline-none focus:ring-2 focus:ring-brand/20'
					/>
					<input
						value={localApp.url}
						onChange={e => handleFieldChange('url', e.target.value)}
						placeholder='https://example.com'
						className='w-full rounded-lg bg-white/80 px-2 py-1 text-center text-[11px] outline-none focus:ring-2 focus:ring-brand/20'
					/>
					<label className='text-secondary flex items-center justify-center gap-1 text-[11px]'>
						<input type='checkbox' checked={visible} onChange={e => handleFieldChange('visible', e.target.checked)} />
						显示
					</label>
				</div>
			) : (
				<>
					<span className='text-primary max-w-24 truncate text-center text-sm font-medium'>{localApp.name}</span>
					<ExternalLink className='text-secondary/0 size-3 transition-colors group-hover:text-secondary/70' />
				</>
			)}

			{showIconDialog && <IconUploadDialog currentIcon={localApp.icon} onClose={() => setShowIconDialog(false)} onSubmit={handleIconSubmit} />}
		</motion.div>
	)

	if (canEdit || isEditMode) return content
	return (
		<a href={localApp.url} target='_blank' rel='noopener noreferrer' aria-label={localApp.name}>
			{content}
		</a>
	)
}
