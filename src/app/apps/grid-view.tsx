'use client'

import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppCard, type AppLink } from './components/app-card'
import type { IconItem } from './components/icon-upload-dialog'

interface GridViewProps {
	apps: AppLink[]
	isEditMode?: boolean
	onUpdate?: (app: AppLink, oldApp: AppLink, iconItem?: IconItem) => void
	onDelete?: (app: AppLink) => void
}

export default function GridView({ apps, isEditMode = false, onUpdate, onDelete }: GridViewProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedTag, setSelectedTag] = useState<string>('all')
	const visibleApps = isEditMode ? apps : apps.filter(app => app.visible !== false)
	const allTags = useMemo(() => Array.from(new Set(visibleApps.flatMap(app => app.tags || []))), [visibleApps])

	const filteredApps = visibleApps.filter(app => {
		const term = searchTerm.trim().toLowerCase()
		const matchesSearch = !term || app.name.toLowerCase().includes(term) || app.url.toLowerCase().includes(term) || (app.description || '').toLowerCase().includes(term)
		const matchesTag = selectedTag === 'all' || (app.tags || []).includes(selectedTag)
		return matchesSearch && matchesTag
	})

	return (
		<div className='mx-auto w-full max-w-6xl px-6 pt-24 pb-16'>
			<div className='mb-10 space-y-4'>
				<div className='group relative mx-auto w-full max-w-md'>
					<Search className='text-secondary pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 transition-colors group-focus-within:text-brand' />
					<input
						type='text'
						placeholder='搜索应用名称、链接或描述'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						className='bg-card/75 placeholder:text-secondary/60 focus:border-brand/40 focus:ring-brand/15 h-12 w-full rounded-2xl border border-white/60 pr-11 pl-11 text-sm shadow-sm backdrop-blur-xl transition-all outline-none focus:bg-white/90 focus:ring-4'
					/>
					{searchTerm && (
						<button type='button' onClick={() => setSearchTerm('')} className='text-secondary hover:text-primary absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-black/5' aria-label='清空搜索'>
							<X className='size-3.5' />
						</button>
					)}
				</div>

				{allTags.length > 0 && (
					<div className='flex flex-wrap justify-center gap-2'>
						<button onClick={() => setSelectedTag('all')} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${selectedTag === 'all' ? 'bg-brand text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>全部</button>
						{allTags.map(tag => (
							<button key={tag} onClick={() => setSelectedTag(tag)} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${selectedTag === tag ? 'bg-brand text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{tag}</button>
						))}
					</div>
				)}
			</div>

			{filteredApps.length > 0 ? (
				<div className='grid grid-cols-4 gap-x-4 gap-y-8 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8'>
					{filteredApps.map((app, index) => (
						<AppCard key={`${app.url}-${index}`} app={app} isEditMode={isEditMode} onUpdate={onUpdate} onDelete={() => onDelete?.(app)} />
					))}
				</div>
			) : (
				<div className='text-secondary mt-16 text-center text-sm'>{visibleApps.length ? '没有找到相关应用' : '还没有应用入口，进入编辑模式后添加一个吧。'}</div>
			)}
		</div>
	)
}
