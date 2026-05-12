'use client'

import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { DialogModal } from '@/components/dialog-modal'

type AssetItem = {
	path: string
	url: string
	used: boolean
	protected: boolean
	deletable: boolean
	size: number
	sizeLabel: string
	source: 'images' | 'blogs'
	ext: string
	references: string[]
}

type AssetSummary = {
	total: number
	used: number
	unused: number
	protected: number
	deletable: number
	totalBytes: number
	unusedBytes: number
}

type AssetResponse = {
	assets: AssetItem[]
	summary: AssetSummary
}

type FilterType = 'all' | 'used' | 'unused' | 'protected'

function formatBytes(bytes: number) {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function statusLabel(asset: AssetItem) {
	if (asset.protected) return '受保护'
	return asset.used ? '已使用' : '未使用'
}

function statusClass(asset: AssetItem) {
	if (asset.protected) return 'border-brand/70 ring-brand/20'
	if (asset.used) return 'border-emerald-400/70 ring-emerald-300/20'
	return 'border-red-400/80 ring-red-300/20'
}

function badgeClass(asset: AssetItem) {
	if (asset.protected) return 'bg-brand text-white'
	if (asset.used) return 'bg-emerald-500 text-white'
	return 'bg-red-500 text-white'
}

interface AssetCleanerDialogProps {
	open: boolean
	onClose: () => void
	onAssetsChanged?: () => Promise<void> | void
}

export function AssetCleanerDialog({ open, onClose, onAssetsChanged }: AssetCleanerDialogProps) {
	const [loading, setLoading] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [editMode, setEditMode] = useState(false)
	const [filter, setFilter] = useState<FilterType>('all')
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const [data, setData] = useState<AssetResponse | null>(null)
	const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

	const loadAssets = async () => {
		setLoading(true)
		try {
			const res = await fetch('/api/admin/assets', { cache: 'no-store' })
			if (!res.ok) {
				const body = await res.json().catch(() => null)
				throw new Error(body?.error || '资源扫描失败')
			}
			const next = (await res.json()) as AssetResponse
			setData(next)
			setSelected(new Set())
			setFailedImages(new Set())
		} catch (error: any) {
			toast.error(error?.message || '资源扫描失败')
		} finally {
			setLoading(false)
		}
	}

	const handleOpen = () => {
		if (!data && !loading) loadAssets()
	}

	const filteredAssets = useMemo(() => {
		const assets = data?.assets || []
		if (filter === 'used') return assets.filter(item => item.used && !item.protected)
		if (filter === 'unused') return assets.filter(item => !item.used && !item.protected)
		if (filter === 'protected') return assets.filter(item => item.protected)
		return assets
	}, [data?.assets, filter])

	const selectableAssets = useMemo(() => (data?.assets || []).filter(item => item.deletable), [data?.assets])

	const toggleSelected = (asset: AssetItem) => {
		if (!editMode) return
		if (!asset.deletable) {
			toast.info(asset.used ? '已使用资源不能删除' : '受保护资源不能删除')
			return
		}
		setSelected(prev => {
			const next = new Set(prev)
			if (next.has(asset.path)) next.delete(asset.path)
			else next.add(asset.path)
			return next
		})
	}

	const selectAllUnused = () => {
		setSelected(new Set(selectableAssets.map(item => item.path)))
	}

	const deleteSelected = async () => {
		if (selected.size === 0) {
			toast.info('请先选择要删除的未使用图片')
			return
		}
		if (!confirm(`确认删除 ${selected.size} 张未使用图片？删除后无法恢复。`)) return
		setDeleting(true)
		try {
			const res = await fetch('/api/admin/assets', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ paths: Array.from(selected) })
			})
			const body = await res.json().catch(() => null)
			if (!res.ok) throw new Error(body?.error || '删除失败')
			setData({ assets: body.assets, summary: body.summary })
			setSelected(new Set())
			setFailedImages(new Set())
			if (onAssetsChanged) {
				await onAssetsChanged()
			}
			const skipped = Array.isArray(body.skipped) ? body.skipped.length : 0
			toast.success(`已删除 ${body.deleted?.length || 0} 张图片${skipped ? `，跳过 ${skipped} 张` : ''}`)
		} catch (error: any) {
			toast.error(error?.message || '删除失败')
		} finally {
			setDeleting(false)
		}
	}

	const close = () => {
		setEditMode(false)
		setSelected(new Set())
		onClose()
	}

	return (
		<DialogModal open={open} onClose={close} className='card scrollbar-none max-h-[86vh] w-[920px] overflow-y-auto p-6' disableCloseOnOverlay={deleting}>
			<div onAnimationStart={handleOpen}>
				<div className='mb-5 flex items-start justify-between gap-4'>
					<div>
						<h2 className='text-xl font-bold'>资源清理</h2>
						<p className='text-secondary mt-1 text-xs'>只扫描后台上传到 data/public 的图片资源，不会删除源码 public 里的默认资源。</p>
					</div>
					<div className='flex shrink-0 gap-2'>
						<button type='button' onClick={loadAssets} disabled={loading || deleting} className='bg-card rounded-xl border px-4 py-2 text-sm'>
							{loading ? '扫描中...' : '刷新扫描'}
						</button>
						<button type='button' onClick={() => setEditMode(prev => !prev)} disabled={loading || deleting} className='bg-card rounded-xl border px-4 py-2 text-sm'>
							{editMode ? '退出编辑' : '编辑'}
						</button>
						<button type='button' onClick={close} disabled={deleting} className='bg-card rounded-xl border px-4 py-2 text-sm'>关闭</button>
					</div>
				</div>

				<div className='mb-4 grid grid-cols-5 gap-2 max-sm:grid-cols-2'>
					{[
						['全部', data?.summary.total || 0],
						['已使用', data?.summary.used || 0],
						['未使用', data?.summary.unused || 0],
						['可删除', data?.summary.deletable || 0],
						['未使用大小', formatBytes(data?.summary.unusedBytes || 0)]
					].map(([label, value]) => (
						<div key={label} className='rounded-2xl border bg-white/40 px-3 py-2'>
							<div className='text-secondary text-[11px]'>{label}</div>
							<div className='mt-1 text-sm font-semibold'>{value}</div>
						</div>
					))}
				</div>

				<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
					<div className='flex gap-2'>
						{[
							['all', '全部'],
							['used', '已使用'],
							['unused', '未使用'],
							['protected', '受保护']
						].map(([value, label]) => (
							<button
								key={value}
								type='button'
								onClick={() => setFilter(value as FilterType)}
								className={`rounded-xl border px-3 py-1.5 text-xs ${filter === value ? 'bg-brand text-white' : 'bg-white/40 text-secondary'}`}>
								{label}
							</button>
						))}
					</div>
					{editMode && (
						<div className='flex gap-2'>
							<button type='button' onClick={selectAllUnused} disabled={deleting} className='bg-card rounded-xl border px-3 py-1.5 text-xs'>勾选所有未使用图片</button>
							<button type='button' onClick={() => setSelected(new Set())} disabled={deleting} className='bg-card rounded-xl border px-3 py-1.5 text-xs'>取消选择</button>
							<button type='button' onClick={deleteSelected} disabled={deleting || selected.size === 0} className='brand-btn px-3 py-1.5 text-xs'>
								{deleting ? '删除中...' : `确认删除${selected.size ? ` ${selected.size}` : ''}`}
							</button>
						</div>
					)}
				</div>

				{loading && <div className='text-secondary flex h-48 items-center justify-center text-sm'>正在扫描资源...</div>}
				{!loading && filteredAssets.length === 0 && <div className='text-secondary flex h-48 items-center justify-center text-sm'>没有符合条件的图片。</div>}
				{!loading && filteredAssets.length > 0 && (
					<div className='grid grid-cols-5 gap-3 max-lg:grid-cols-4 max-sm:grid-cols-2'>
						{filteredAssets.map(asset => {
							const checked = selected.has(asset.path)
							const failed = failedImages.has(asset.path)
							return (
								<motion.button
									key={asset.path}
									type='button'
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									onClick={() => toggleSelected(asset)}
									className={`relative rounded-2xl border bg-white/50 p-2 text-left transition-all ${statusClass(asset)} ${checked ? 'ring-brand ring-2' : 'hover:bg-white/70'}`}>
									{editMode && asset.deletable && (
										<span className={`absolute top-3 left-3 z-10 flex h-5 w-5 items-center justify-center rounded-full border bg-white text-xs ${checked ? 'border-brand text-brand' : 'border-gray-300'}`}>
											{checked ? '✓' : ''}
										</span>
									)}
									<div className='aspect-square overflow-hidden rounded-xl bg-secondary/10'>
										{failed ? (
											<div className='text-secondary flex h-full items-center justify-center text-xs'>无法预览</div>
										) : (
											<img src={asset.url} alt={asset.path} className='h-full w-full object-cover' loading='lazy' onError={() => setFailedImages(prev => new Set(prev).add(asset.path))} />
										)}
									</div>
									<div className='mt-2 flex items-center justify-between gap-2'>
										<span className={`rounded-full px-2 py-0.5 text-[10px] ${badgeClass(asset)}`}>{statusLabel(asset)}</span>
										<span className='text-secondary text-[10px]'>{asset.sizeLabel}</span>
									</div>
									<div className='mt-1 truncate text-[11px]' title={asset.path}>{asset.path}</div>
									<div className='text-secondary mt-0.5 text-[10px]'>{asset.source} · {asset.ext || 'file'}{asset.references.length ? ` · ${asset.references.length} 引用` : ''}</div>
								</motion.button>
							)
						})}
					</div>
				)}
			</div>
		</DialogModal>
	)
}
