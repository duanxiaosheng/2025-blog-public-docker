'use client'

import { AppCard, type AppLink } from './components/app-card'
import type { IconItem } from './components/icon-upload-dialog'

interface GridViewProps {
	apps: AppLink[]
	isEditMode?: boolean
	onUpdate?: (app: AppLink, oldApp: AppLink, iconItem?: IconItem) => void
	onDelete?: (app: AppLink) => void
}

export default function GridView({ apps, isEditMode = false, onUpdate, onDelete }: GridViewProps) {
	const visibleApps = isEditMode ? apps : apps.filter(app => app.visible !== false)

	return (
		<div className='mx-auto w-full max-w-6xl px-6 pt-24 pb-16'>
			<div className='mb-10 text-center'>
				<h1 className='font-averia text-primary text-4xl font-semibold'>应用导航</h1>
				<p className='text-secondary mt-3 text-sm'>把常用网站、工具和个人入口收在这里</p>
			</div>

			{visibleApps.length > 0 ? (
				<div className='grid grid-cols-4 gap-x-4 gap-y-8 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8'>
					{visibleApps.map((app, index) => (
						<AppCard key={`${app.url}-${index}`} app={app} isEditMode={isEditMode} onUpdate={onUpdate} onDelete={() => onDelete?.(app)} />
					))}
				</div>
			) : (
				<div className='text-secondary mt-16 text-center text-sm'>还没有应用入口，进入编辑模式后添加一个吧。</div>
			)}
		</div>
	)
}
