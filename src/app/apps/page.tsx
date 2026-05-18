'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import GridView from './grid-view'
import CreateDialog from './components/create-dialog'
import { pushApps } from './services/push-apps'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import initialList from './list.json'
import type { AppLink } from './components/app-card'
import type { IconItem } from './components/icon-upload-dialog'
import { AdminPasswordDialog } from '@/components/admin-password-dialog'

export default function Page() {
	const [apps, setApps] = useState<AppLink[]>([])
	const [originalApps, setOriginalApps] = useState<AppLink[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [editingApp, setEditingApp] = useState<AppLink | null>(null)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [iconItems, setIconItems] = useState<Map<string, IconItem>>(new Map())

	const { isAuth } = useAuthStore()
	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	useEffect(() => {
		fetch('/api/content/apps', { cache: 'no-store' })
			.then(res => (res.ok ? res.json() : Promise.reject(new Error('fetch apps failed'))))
			.then((data: AppLink[]) => {
				setApps(data)
				setOriginalApps(data)
			})
			.catch(() => {
				setApps(initialList as AppLink[])
				setOriginalApps(initialList as AppLink[])
			})
			.finally(() => {
				setIsLoading(false)
			})
	}, [])

	const rememberIconItem = (app: AppLink, iconItem?: IconItem) => {
		if (!iconItem) return
		setIconItems(prev => {
			const newMap = new Map(prev)
			newMap.set(app.url, iconItem)
			return newMap
		})
	}

	const handleUpdate = (updatedApp: AppLink, oldApp: AppLink, iconItem?: IconItem) => {
		setApps(prev => prev.map(item => (item.url === oldApp.url ? updatedApp : item)))
		if (iconItem) {
			rememberIconItem(updatedApp, iconItem)
		} else if (updatedApp.url !== oldApp.url) {
			setIconItems(prev => {
				const existing = prev.get(oldApp.url)
				if (!existing) return prev
				const newMap = new Map(prev)
				newMap.delete(oldApp.url)
				newMap.set(updatedApp.url, existing)
				return newMap
			})
		}
	}

	const handleAdd = () => {
		setEditingApp(null)
		setIsCreateDialogOpen(true)
	}

	const handleSaveApp = (updatedApp: AppLink, iconItem?: IconItem) => {
		if (editingApp) setApps(apps.map(item => (item.url === editingApp.url ? updatedApp : item)))
		else setApps([...apps, updatedApp])
		rememberIconItem(updatedApp, iconItem)
	}

	const handleDelete = (app: AppLink) => {
		if (confirm(`确定要删除 ${app.name} 吗？`)) setApps(apps.filter(item => item.url !== app.url))
	}

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
			const savedApps = await pushApps({ apps, iconItems })
			setApps(savedApps)
			setOriginalApps(savedApps)
			setIconItems(new Map())
			setIsEditMode(false)
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save apps:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setApps(originalApps)
		setIconItems(new Map())
		setIsEditMode(false)
	}

	const buttonText = isAuth ? '保存' : '请先登录'

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isEditMode])

	return (
		<>
			{isLoading ? (
				<div className='text-secondary flex justify-center px-6 pt-32 pb-12 text-sm'>加载中...</div>
			) : (
				<GridView apps={apps} isEditMode={isEditMode} onUpdate={handleUpdate} onDelete={handleDelete} />
			)}

			<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className='absolute top-4 right-6 flex gap-3 max-sm:hidden'>
				<AdminPasswordDialog />
				{isEditMode ? (
					<>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCancel} disabled={isSaving} className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>取消</motion.button>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAdd} className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>添加</motion.button>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveClick} disabled={isSaving} className='brand-btn px-6'>{isSaving ? '保存中...' : buttonText}</motion.button>
					</>
				) : (
					!hideEditButton && <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsEditMode(true)} className='bg-card rounded-xl border px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80'>编辑</motion.button>
				)}
			</motion.div>

			{isCreateDialogOpen && <CreateDialog app={editingApp} onClose={() => setIsCreateDialogOpen(false)} onSave={handleSaveApp} />}
		</>
	)
}
