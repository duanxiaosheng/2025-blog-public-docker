'use client'

import { useState } from 'react'
import { useAuthStore } from '@/hooks/use-auth'
import { AssetCleanerDialog } from './asset-cleaner-dialog'

export function AssetCleanerSection() {
	const [open, setOpen] = useState(false)
	const { isAuth } = useAuthStore()

	return (
		<div className='rounded-2xl border bg-white/30 p-4'>
			<div className='flex items-center justify-between gap-4'>
				<div>
					<label className='block text-sm font-medium'>资源管理</label>
					<p className='text-secondary mt-1 text-xs'>扫描后台上传图片，查看已使用/未使用状态，并安全删除未使用图片。</p>
				</div>
				<button
					type='button'
					onClick={() => setOpen(true)}
					disabled={!isAuth}
					className={`${isAuth ? 'brand-btn' : 'bg-card text-secondary cursor-not-allowed'} shrink-0 rounded-xl border px-4 py-2 text-sm`}>
					{isAuth ? '打开资源清理' : '登录后可用'}
				</button>
			</div>
			{!isAuth && <p className='text-secondary mt-2 text-[11px]'>请先点击右上角“管理员登录”，登录后即可管理上传资源。</p>}
			<AssetCleanerDialog open={open} onClose={() => setOpen(false)} />
		</div>
	)
}
