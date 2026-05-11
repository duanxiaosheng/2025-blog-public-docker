'use client'

import { useMemo, useState } from 'react'
import { DialogModal } from '@/components/dialog-modal'

type MarkdownImageProps = {
	src: string
	alt?: string
	title?: string
}

function normalizeMarkdownImageSrc(src: string) {
	if (!src) return src
	let normalized = src.trim()
	while (normalized.includes('/api/api/')) {
		normalized = normalized.replaceAll('/api/api/', '/api/')
	}
	return normalized
}

export function MarkdownImage({ src, alt = '', title = '' }: MarkdownImageProps) {
	const [display, setDisplay] = useState(false)
	const normalizedSrc = useMemo(() => normalizeMarkdownImageSrc(src), [src])

	return (
		<>
			<img src={normalizedSrc} alt={alt} title={title} loading='lazy' onClick={() => setDisplay(true)} className='cursor-pointer transition-opacity hover:opacity-80' />
			<DialogModal open={display} onClose={() => setDisplay(false)} className='max-w-none bg-transparent p-0'>
				<img src={normalizedSrc} alt={alt} className='max-h-[90vh] max-w-full rounded-2xl object-contain' />
			</DialogModal>
		</>
	)
}
