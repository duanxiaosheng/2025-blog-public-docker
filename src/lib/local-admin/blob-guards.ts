function isBlobUrl(value: unknown) {
	return typeof value === 'string' && value.startsWith('blob:')
}

export function assertNoBlobImageUrls(items: unknown[], fields: string[], message = '有图片还只是临时预览地址，请重新选择图片后再保存') {
	for (const item of items as Array<Record<string, unknown>>) {
		for (const field of fields) {
			const value = item?.[field]
			if (isBlobUrl(value)) throw new Error(message)
			if (Array.isArray(value) && value.some(isBlobUrl)) throw new Error(message)
		}
	}
}
