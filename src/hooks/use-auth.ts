import { create } from 'zustand'

interface AuthStore {
	isAuth: boolean
	refreshAuthState: () => Promise<void>
	login: (password: string) => Promise<void>
	logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	isAuth: false,
	refreshAuthState: async () => {
		const res = await fetch('/api/admin/session', { cache: 'no-store' })
		const data = await res.json().catch(() => ({ authenticated: false }))
		set({ isAuth: !!data?.authenticated })
	},
	login: async (password: string) => {
		const res = await fetch('/api/admin/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password })
		})
		if (!res.ok) {
			const data = await res.json().catch(() => null)
			throw new Error(data?.error || '登录失败')
		}
		set({ isAuth: true })
	},
	logout: async () => {
		await fetch('/api/admin/logout', { method: 'POST' })
		set({ isAuth: false })
	}
}))

useAuthStore.getState().refreshAuthState().catch(() => {})
