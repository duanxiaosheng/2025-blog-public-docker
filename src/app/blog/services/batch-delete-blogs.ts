export async function batchDeleteBlogs(slugs: string[]): Promise<void> {
	const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)))
	if (uniqueSlugs.length === 0) {
		throw new Error('需要至少选择一篇文章')
	}

	for (const slug of uniqueSlugs) {
		const res = await fetch(`/api/admin/blogs/${encodeURIComponent(slug)}`, {
			method: 'DELETE'
		})
		if (!res.ok) {
			const body = await res.json().catch(() => null)
			throw new Error(body?.error || `删除 ${slug} 失败`)
		}
	}
}
