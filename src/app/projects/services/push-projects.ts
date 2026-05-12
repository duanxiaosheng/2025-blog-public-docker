import { toast } from 'sonner'
import type { Project } from '../components/project-card'
import type { ImageItem } from '../components/image-upload-dialog'
import { assertNoBlobImageUrls, uploadPublicImage } from '@/lib/local-admin/public-image-upload-client'

export type PushProjectsParams = {
	projects: Project[]
	imageItems?: Map<string, ImageItem>
}

export async function pushProjects(params: PushProjectsParams): Promise<void> {
	const nextProjects = await Promise.all(
		params.projects.map(async project => {
			const item = params.imageItems?.get(project.url)
			if (!item) return project
			const image = await uploadPublicImage('project', item, '项目图片上传失败')
			return { ...project, image }
		})
	)
	assertNoBlobImageUrls(nextProjects, ['image'])

	const res = await fetch('/api/admin/projects', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ projects: nextProjects })
	})
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || '保存失败')
	}
	toast.success('发布成功！')
}
