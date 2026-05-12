'use client'

import { Search, X } from 'lucide-react'
import { useState } from 'react'

import { type AvatarItem } from './components/avatar-upload-dialog'
import { BloggerCard } from './components/blogger-card'

export type BloggerStatus = 'recent' | 'disconnected'

export interface Blogger {
	name: string
	avatar: string
	url: string
	description: string
	stars: number
	status?: BloggerStatus
}

interface GridViewProps {
	bloggers: Blogger[]
	isEditMode?: boolean
	onUpdate?: (blogger: Blogger, oldBlogger: Blogger, avatarItem?: AvatarItem) => void
	onDelete?: (blogger: Blogger) => void
}

export default function GridView({ bloggers, isEditMode = false, onUpdate, onDelete }: GridViewProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCategory, setSelectedCategory] = useState<BloggerStatus>('recent')

	const filteredBloggers = bloggers.filter(blogger => {
		const status = blogger.status ?? 'recent'
		const matchesCategory = status === selectedCategory
		const matchesSearch =
			blogger.name.toLowerCase().includes(searchTerm.toLowerCase()) || blogger.description.toLowerCase().includes(searchTerm.toLowerCase())
		return matchesCategory && matchesSearch
	})

	return (
		<div className='mx-auto w-full max-w-7xl px-6 pt-24 pb-12'>
			<div className='mb-8 space-y-4'>
				<div className='group relative mx-auto w-full max-w-md'>
					<Search className='text-secondary pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 transition-colors group-focus-within:text-brand' />
					<input
						type='text'
						placeholder='搜索博主名称或简介'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						className='bg-card/75 placeholder:text-secondary/60 focus:border-brand/40 focus:ring-brand/15 h-12 w-full rounded-2xl border border-white/60 pr-11 pl-11 text-sm shadow-sm backdrop-blur-xl transition-all outline-none focus:bg-white/90 focus:ring-4'
					/>
					{searchTerm && (
						<button
							type='button'
							onClick={() => setSearchTerm('')}
							className='text-secondary hover:text-primary absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-black/5'
							aria-label='清空搜索'>
							<X className='size-3.5' />
						</button>
					)}
				</div>

				<div className='flex flex-wrap justify-center gap-2'>
					<button
						onClick={() => setSelectedCategory('recent')}
						className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
							selectedCategory === 'recent' ? 'bg-brand text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}>
						近期更新
					</button>
					<button
						onClick={() => setSelectedCategory('disconnected')}
						className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
							selectedCategory === 'disconnected' ? 'bg-brand text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}>
						长期失联
					</button>
				</div>
			</div>

			<div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
				{filteredBloggers.map(blogger => (
					<BloggerCard key={blogger.url} blogger={blogger} isEditMode={isEditMode} onUpdate={onUpdate} onDelete={() => onDelete?.(blogger)} />
				))}
			</div>

			{filteredBloggers.length === 0 && (
				<div className='mt-12 text-center text-gray-500'>
					<p>没有找到相关博主</p>
				</div>
			)}
		</div>
	)
}
