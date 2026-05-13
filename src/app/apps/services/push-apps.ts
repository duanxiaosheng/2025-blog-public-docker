import { toast } from 'sonner'
import type { AppLink } from '../components/app-card'
import type { IconItem } from '../components/icon-upload-dialog'
import { assertNoBlobImageUrls, uploadPublicImage } from '@/lib/local-admin/public-image-upload-client'

export type PushAppsParams = {
	apps: AppLink[]
	iconItems?: Map<string, IconItem>
}

export async function prepareAppsForSave(params: PushAppsParams): Promise<AppLink[]> {
	const nextApps = await Promise.all(
		params.apps.map(async app => {
			const item = params.iconItems?.get(app.url)
			if (!item) return app
			const icon = await uploadPublicImage('apps', item, '应用图标上传失败')
			return { ...app, icon }
		})
	)
	assertNoBlobImageUrls(nextApps, ['icon'])
	return nextApps
}

export async function pushApps(params: PushAppsParams): Promise<AppLink[]> {
	const nextApps = await prepareAppsForSave(params)
	const res = await fetch('/api/admin/apps', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ apps: nextApps })
	})
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || '保存失败')
	}
	toast.success('发布成功！')
	return nextApps
}
