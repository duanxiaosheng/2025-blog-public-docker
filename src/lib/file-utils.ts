'use client'

export function readFileAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(String(reader.result || ''))
		reader.onerror = reject
		reader.readAsText(file)
	})
}

export function fileToBase64NoPrefix(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			const dataUrl = String(reader.result || '')
			resolve(dataUrl.replace(/^data:[^;]+;base64,/, ''))
		}
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}

function fallbackHash(bytes: Uint8Array): string {
	let h1 = 0x811c9dc5
	let h2 = 0x811c9dc5
	for (let i = 0; i < bytes.length; i++) {
		const b = bytes[i]
		h1 ^= b
		h1 = Math.imul(h1, 0x01000193)
		h2 ^= bytes[bytes.length - 1 - i]
		h2 = Math.imul(h2, 0x01000193)
	}
	const p1 = (h1 >>> 0).toString(16).padStart(8, '0')
	const p2 = (h2 >>> 0).toString(16).padStart(8, '0')
	return `${p1}${p2}`
}

export async function hashFileSHA256(file: File): Promise<string> {
	const buf = await file.arrayBuffer()
	const bytes = new Uint8Array(buf)
	const subtle = globalThis.crypto?.subtle

	if (subtle?.digest) {
		const digest = await subtle.digest('SHA-256', buf)
		const digestBytes = new Uint8Array(digest)
		let hex = ''
		for (let i = 0; i < digestBytes.length; i++) {
			const h = digestBytes[i].toString(16).padStart(2, '0')
			hex += h
		}
		return hex.slice(0, 16)
	}

	return fallbackHash(bytes)
}
