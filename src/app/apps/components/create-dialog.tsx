'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { DialogModal } from '@/components/dialog-modal'
import IconUploadDialog, { type IconItem } from './icon-upload-dialog'
import type { AppLink } from './app-card'

interface CreateDialogProps {
	app: AppLink | null
	onClose: () => void
	onSave: (app: AppLink, iconItem?: IconItem) => void
}

export default function CreateDialog({ app, onClose, onSave }: CreateDialogProps) {
	const [formData, setFormData] = useState<AppLink>({ name: '', icon: '', url: '', visible: true })
	const [showIconDialog, setShowIconDialog] = useState(false)
	const [selectedIconItem, setSelectedIconItem] = useState<IconItem | null>(null)

	useEffect(() => {
		setFormData(app || { name: '', icon: '', url: '', visible: true })
		setSelectedIconItem(null)
	}, [app])

	const handleIconSubmit = (icon: IconItem) => {
		setSelectedIconItem(icon)
		setFormData({ ...formData, icon: icon.type === 'url' ? icon.url : icon.previewUrl })
	}

	const handleSubmit = () => {
		if (!formData.name.trim() || !formData.icon.trim() || !formData.url.trim()) {
			toast.error('请填写应用名称、图标和链接')
			return
		}
		onSave({ ...formData, name: formData.name.trim(), url: formData.url.trim(), visible: formData.visible !== false }, selectedIconItem || undefined)
		onClose()
		toast.success(app ? '更新成功' : '添加成功')
	}

	return (
		<DialogModal open onClose={onClose} className='card w-sm'>
			<div className='mb-5 flex items-center gap-4'>
				<div className='group relative cursor-pointer' onClick={() => setShowIconDialog(true)}>
					{formData.icon ? (
						<>
							<img src={formData.icon} alt={formData.name} className='h-16 w-16 rounded-2xl object-cover' />
							<div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'><span className='text-xs text-white'>更换</span></div>
						</>
					) : (
						<div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-200'><Plus className='h-6 w-6 text-gray-500' /></div>
					)}
				</div>
				<div className='flex-1'>
					<input type='text' value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder='应用名称' className='w-full text-lg font-bold focus:outline-none' />
					<input type='url' value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} placeholder='https://example.com' className='text-secondary mt-1 w-full truncate text-xs focus:outline-none' />
				</div>
			</div>

			<label className='text-secondary flex items-center gap-2 text-sm'>
				<input type='checkbox' checked={formData.visible !== false} onChange={e => setFormData({ ...formData, visible: e.target.checked })} />
				在应用导航中显示
			</label>

			<div className='mt-6 flex gap-3'>
				<button onClick={onClose} className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm transition-colors hover:bg-gray-50'>取消</button>
				<button onClick={handleSubmit} className='brand-btn flex-1 justify-center px-4'>{app ? '保存' : '添加'}</button>
			</div>

			{showIconDialog && <IconUploadDialog currentIcon={formData.icon} onClose={() => setShowIconDialog(false)} onSubmit={handleIconSubmit} />}
		</DialogModal>
	)
}
