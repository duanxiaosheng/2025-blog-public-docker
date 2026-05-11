import { create } from 'zustand'
import sourceSiteContent from '@/config/site-content.json'
import sourceCardStyles from '@/config/card-styles.json'

export type SiteContent = typeof sourceSiteContent
export type CardStyles = typeof sourceCardStyles

interface ConfigStore {
	siteContent: SiteContent
	cardStyles: CardStyles
	regenerateKey: number
	configDialogOpen: boolean
	setSiteContent: (content: SiteContent) => void
	setCardStyles: (styles: CardStyles) => void
	resetSiteContent: () => void
	resetCardStyles: () => void
	regenerateBubbles: () => void
	setConfigDialogOpen: (open: boolean) => void
	refreshRemoteConfig: () => Promise<void>
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
	siteContent: { ...sourceSiteContent },
	cardStyles: { ...sourceCardStyles },
	regenerateKey: 0,
	configDialogOpen: false,
	setSiteContent: (content: SiteContent) => {
		set({ siteContent: content })
	},
	setCardStyles: (styles: CardStyles) => {
		set({ cardStyles: styles })
	},
	resetSiteContent: () => {
		set({ siteContent: { ...sourceSiteContent } })
	},
	resetCardStyles: () => {
		set({ cardStyles: { ...sourceCardStyles } })
	},
	regenerateBubbles: () => {
		set(state => ({ regenerateKey: state.regenerateKey + 1 }))
	},
	setConfigDialogOpen: (open: boolean) => {
		set({ configDialogOpen: open })
	},
	refreshRemoteConfig: async () => {
		const [siteRes, cardRes] = await Promise.all([
			fetch('/api/config/site-content', { cache: 'no-store' }),
			fetch('/api/config/card-styles', { cache: 'no-store' })
		])
		const nextSiteContent = siteRes.ok ? await siteRes.json().catch(() => sourceSiteContent) : sourceSiteContent
		const nextCardStyles = cardRes.ok ? await cardRes.json().catch(() => sourceCardStyles) : sourceCardStyles
		set({
			siteContent: nextSiteContent,
			cardStyles: nextCardStyles
		})
	}
}))

useConfigStore.getState().refreshRemoteConfig().catch(() => {})

