export async function deleteBlog(slug: string): Promise<void> {
	const response = await fetch(`/api/admin/blogs/${encodeURIComponent(slug)}`, {
		method: 'DELETE'
	})
	if (!response.ok) {
		const data = await response.json().catch(() => null)
		throw new Error(data?.error || '删除失败')
	}
}
