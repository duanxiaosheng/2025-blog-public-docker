import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useWriteStore } from '../stores/write-store'
import { usePreviewStore } from '../stores/preview-store'
import { usePublish } from '../hooks/use-publish'
import { AdminPasswordDialog } from '@/components/admin-password-dialog'

export function WriteActions() {
	const { loading, mode, form, originalSlug, updateForm } = useWriteStore()
	const { openPreview } = usePreviewStore()
	const { isAuth, onPublish, onDelete } = usePublish()
	const mdInputRef = useRef<HTMLInputElement>(null)
	const [confirmingDelete, setConfirmingDelete] = useState(false)
	const router = useRouter()

	const handleImportOrPublish = () => {
		if (!isAuth) {
			toast.info('请先登录管理员密码')
			return
		}
		onPublish()
	}

	const handleCancel = () => {
		const target = mode === 'edit' && originalSlug ? `/blog/${originalSlug}` : '/'
		router.push(target)
		window.setTimeout(() => {
			if (window.location.pathname !== target) window.location.href = target
		}, 120)
	}

	const buttonText = isAuth ? (mode === 'edit' ? '更新' : '发布') : '请先登录'

	const handleDelete = () => {
		if (!isAuth) {
			toast.info('请先登录管理员密码')
			return
		}
		setConfirmingDelete(true)
	}

	const handleImportMd = () => {
		mdInputRef.current?.click()
	}

	const handleMdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		try {
			const text = await file.text()
			updateForm({ md: text })
			toast.success('已导入 Markdown 文件')
		} catch (error) {
			toast.error('导入失败，请重试')
		} finally {
			if (e.currentTarget) e.currentTarget.value = ''
		}
	}

	return (
		<>
			<input ref={mdInputRef} type='file' accept='.md' className='hidden' onChange={handleMdFileChange} />

			<div className='fixed top-4 right-6 z-[9999] flex items-center gap-2 rounded-2xl bg-white/70 p-1 shadow-sm backdrop-blur-md'>
				<div>
					<AdminPasswordDialog />
				</div>
				{mode === 'edit' && (
					<>
						<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className='flex items-center gap-2'>
							<div className='rounded-lg border bg-blue-50 px-4 py-2 text-sm text-blue-700'>编辑模式</div>
						</motion.div>

						<button
							type='button'
							className='rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60'
							disabled={loading}
							onPointerDown={e => e.stopPropagation()}
							onClick={handleDelete}>
							删除
						</button>

						<button
							type='button'
							onClick={handleCancel}
							disabled={loading}
							onPointerDown={e => e.stopPropagation()}
							className='bg-card rounded-xl border px-4 py-2 text-sm disabled:opacity-60'>
							取消
						</button>

						{confirmingDelete && (
							<div className='flex items-center gap-2 rounded-xl border border-red-200 bg-white/95 px-3 py-2 text-sm shadow-sm backdrop-blur'>
								<span className='text-red-600'>{form?.title ? `确认删除《${form.title}》？` : '确认删除？'}</span>
								<button type='button' className='rounded-lg bg-red-500 px-3 py-1 text-white' disabled={loading} onClick={onDelete}>
									确认
								</button>
								<button type='button' className='rounded-lg border px-3 py-1' disabled={loading} onClick={() => setConfirmingDelete(false)}>
									取消
								</button>
							</div>
						)}
					</>
				)}

				<motion.button
					type='button'
					initial={{ opacity: 0, scale: 0.6 }}
					animate={{ opacity: 1, scale: 1 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='bg-card rounded-xl border px-4 py-2 text-sm'
					disabled={loading}
					onClick={handleImportMd}>
					导入 MD
				</motion.button>
				<motion.button
					type='button'
					initial={{ opacity: 0, scale: 0.6 }}
					animate={{ opacity: 1, scale: 1 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='bg-card rounded-xl border px-6 py-2 text-sm'
					disabled={loading}
					onClick={openPreview}>
					预览
				</motion.button>
				<motion.button
					type='button'
					initial={{ opacity: 0, scale: 0.6 }}
					animate={{ opacity: 1, scale: 1 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='brand-btn px-6'
					disabled={loading}
					onClick={handleImportOrPublish}>
					{buttonText}
				</motion.button>
			</div>
		</>
	)
}
