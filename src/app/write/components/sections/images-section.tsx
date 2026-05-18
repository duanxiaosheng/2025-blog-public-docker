'use client'

import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useWriteStore } from '../../stores/write-store'
import Link from 'next/link'

function normalizeEditorAssetUrl(url: string) {
	if (!url) return url
	let normalized = url.trim()
	while (normalized.includes('/api/api/')) {
		normalized = normalized.replaceAll('/api/api/', '/api/')
	}
	return normalized
}

type ImagesSectionProps = {
	delay?: number
}

export function ImagesSection({ delay = 0 }: ImagesSectionProps) {
	const { images, cover, addUrlImage, addFiles, deleteImage, insertAtCursor } = useWriteStore()
	const [urlInput, setUrlInput] = useState<string>('')
	const fileInputRef = useRef<HTMLInputElement>(null)

	const coverId = cover?.id ?? null
	const insertImageMarkdown = (markdown: string) => {
		insertAtCursor(`${markdown}\n`)
	}

	return (
		<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }} className='card relative'>
			<div className='flex items-center justify-between'>
				<h2 className='text-sm'>图片管理</h2>
				<Link href='/image-toolbox' target='_blank' className='text-xs hover:underline'>
					压缩工具
				</Link>
			</div>

			<div className='mt-3 flex items-center gap-2'>
				<input
					type='text'
					placeholder='https://...'
					className='bg-card flex-1 rounded-lg border px-3 py-2 text-sm'
					value={urlInput}
					onChange={e => setUrlInput(e.target.value)}
				/>
				<button
					className='rounded-lg border bg-white/70 px-3 py-2 text-sm'
					onClick={() => {
						const v = urlInput.trim()
						if (!v) return
						addUrlImage(v)
						setUrlInput('')
					}}>
					添加
				</button>
			</div>

			<input
				ref={fileInputRef}
				type='file'
				accept='image/*'
				multiple
				className='hidden'
				onChange={e => {
					const files = e.target.files
					if (files && files.length > 0) {
						addFiles(files)
					}
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<div className='mt-3 grid grid-cols-4 gap-2 sm:grid-cols-4'>
				{/* plus tile */}
				<div
					className='group bg-card hover:bg-secondary/20 relative grid aspect-square cursor-pointer place-items-center rounded-lg border'
					onClick={() => fileInputRef.current?.click()}
					onDragOver={e => {
						e.preventDefault()
					}}
					onDrop={e => {
						e.preventDefault()
						const files = e.dataTransfer.files
						if (files && files.length) addFiles(files)
					}}>
					<span className='text-2xl leading-none text-neutral-400'>+</span>
				</div>

				{images.map(item => {
					const isUrl = item.type === 'url'
					const src = isUrl ? normalizeEditorAssetUrl(item.url) : item.previewUrl
					const markdown = isUrl ? `![](${normalizeEditorAssetUrl(item.url)})` : `![](local-image:${item.id})`
					const isCover = coverId === item.id

					return (
						<div
							key={item.id}
							className={`group relative aspect-square overflow-hidden rounded-xl border bg-white/50 text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isCover ? 'ring-2 ring-blue-500' : ''}`}>
							<img
								src={src}
								className='h-full w-full object-cover'
								draggable
								onDragStart={e => {
									e.dataTransfer.setData('text/plain', markdown)
									e.dataTransfer.setData('text/markdown', markdown)
								}}
							/>
							<div className='pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent opacity-80 transition group-hover:opacity-100' />
							{isCover && <div className='absolute top-2 left-2 rounded-full bg-blue-500 px-2 py-1 text-[10px] text-white shadow'>封面</div>}
							<div className='absolute top-2 right-2 hidden gap-1 group-hover:flex'>
								<button
									type='button'
									className='rounded-full bg-white/88 px-2 py-1 text-[10px] shadow-sm backdrop-blur transition hover:bg-white'
									onClick={() => deleteImage(item.id)}>
									删除
								</button>
							</div>
							<div className='absolute inset-x-2 bottom-2 flex items-center justify-between gap-2'>
								<div className='min-w-0 rounded-full bg-black/45 px-2 py-1 text-[10px] text-white/90 backdrop-blur'>
									<span className='block truncate'>{isUrl ? '外链图片' : item.filename}</span>
								</div>
								<button
									type='button'
									className='rounded-full border border-white/60 bg-white/88 px-3 py-1 text-[10px] font-medium text-neutral-700 shadow-sm backdrop-blur transition hover:scale-[1.02] hover:bg-white active:scale-[0.98]'
									onClick={() => insertImageMarkdown(markdown)}>
									插入
								</button>
							</div>
						</div>
					)
				})}
			</div>
		</motion.div>
	)
}
