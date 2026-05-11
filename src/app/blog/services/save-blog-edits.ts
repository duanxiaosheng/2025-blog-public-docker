export async function saveBlogEdits(originalItems: any[], items: any[], categories: string[]): Promise<void> {
	const response = await fetch('/api/admin/blog-index', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ originalItems, items, categories })
	})
	if (!response.ok) {
		const data = await response.json().catch(() => null)
		throw new Error(data?.error || '保存失败')
	}
}
