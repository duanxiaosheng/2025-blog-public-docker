import { toast } from 'sonner'

export type AboutData = {
	title: string
	description: string
	content: string
}

export async function pushAbout(data: AboutData): Promise<void> {
	const res = await fetch('/api/admin/about', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	})
	if (!res.ok) {
		const body = await res.json().catch(() => null)
		throw new Error(body?.error || '保存失败')
	}
	toast.success('发布成功！')
}
