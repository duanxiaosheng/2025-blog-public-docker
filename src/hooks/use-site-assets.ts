'use client'

import { useEffect, useState } from 'react'

export type SiteAssetVersions = {
	avatar: string
	favicon: string
}

const DEFAULT_VERSIONS: SiteAssetVersions = { avatar: 'initial', favicon: 'initial' }

let listeners = new Set<(versions: SiteAssetVersions) => void>()
let currentVersions: SiteAssetVersions = DEFAULT_VERSIONS

function notify(versions: SiteAssetVersions) {
	currentVersions = versions
	listeners.forEach(listener => listener(versions))
}

export function siteAssetUrl(kind: keyof SiteAssetVersions, version = currentVersions[kind]) {
	return `/api/site-assets/${kind}?v=${encodeURIComponent(version || Date.now().toString())}`
}

export async function refreshSiteAssetVersions() {
	const res = await fetch('/api/site-assets/version', { cache: 'no-store' })
	const next = res.ok ? ((await res.json()) as SiteAssetVersions) : { avatar: Date.now().toString(), favicon: Date.now().toString() }
	notify(next)
	return next
}

export function forceSiteAssetVersions(kind?: keyof SiteAssetVersions) {
	const now = Date.now().toString()
	const next = kind ? { ...currentVersions, [kind]: now } : { avatar: now, favicon: now }
	notify(next)
	return next
}

export function applyFaviconVersion(version = currentVersions.favicon) {
	if (typeof document === 'undefined') return
	const href = siteAssetUrl('favicon', version)
	const existing = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'))
	if (existing.length === 0) {
		const link = document.createElement('link')
		link.rel = 'icon'
		link.href = href
		document.head.appendChild(link)
		return
	}
	existing.forEach(link => {
		link.href = href
	})
}

export function useSiteAssetVersions() {
	const [versions, setVersions] = useState<SiteAssetVersions>(currentVersions)
	useEffect(() => {
		listeners.add(setVersions)
		refreshSiteAssetVersions().then(next => applyFaviconVersion(next.favicon)).catch(() => {})
		return () => {
			listeners.delete(setVersions)
		}
	}, [])
	return versions
}

export function useSiteAssetUrl(kind: keyof SiteAssetVersions) {
	const versions = useSiteAssetVersions()
	return siteAssetUrl(kind, versions[kind])
}
