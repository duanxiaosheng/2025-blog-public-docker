import { toast } from 'sonner'
import type { Project } from '../components/project-card'
import type { ImageItem } from '../components/image-upload-dialog'

export type PushProjectsParams = {
	projects: Project[]
	imageItems?: Map<string, ImageItem>
}

async function uploadImage(section: string, item: ImageItem) {
	if (item.type === 'url') return item.url
	const formData = new FormData()
	formData.append('section', section)
	formData.append('file', item.file)
	const res = await fetch('/api/admin/upload-public-image', { method: 'POST', body: formData })
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || '项目图片上传失败')
	}
	const body = await res.json().catch(() => null)
	return String(body?.path || '')
}

export async function pushProjects(params: PushProjectsParams): Promise<void> {
	const nextProjects = await Promise.all(
		params.projects.map(async project => {
			const item = params.imageItems?.get(project.url)
			if (!item) return project
			const image = await uploadImage('project', item)
			return { ...project, image }
		})
	)

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
