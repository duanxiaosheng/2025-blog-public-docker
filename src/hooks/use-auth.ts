import { create } from 'zustand'

interface AuthStore {
	isAuth: boolean
	isInitialized: boolean
	usesEnvPassword: boolean
	refreshAuthState: () => Promise<void>
	login: (password: string) => Promise<void>
	logout: () => Promise<void>
	initialize: (password: string, confirmPassword: string) => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	isAuth: false,
	isInitialized: true,
	usesEnvPassword: false,
	refreshAuthState: async () => {
		const res = await fetch('/api/admin/session', { cache: 'no-store' })
		const data = await res.json().catch(() => ({ authenticated: false, initialized: true, usesEnvPassword: false }))
		set({
			isAuth: !!data?.authenticated,
			isInitialized: data?.initialized !== false,
			usesEnvPassword: !!data?.usesEnvPassword
		})
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
	},
	initialize: async (password: string, confirmPassword: string) => {
		const res = await fetch('/api/admin/init', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password, confirmPassword })
		})
		if (!res.ok) {
			const data = await res.json().catch(() => null)
			throw new Error(data?.error || '初始化失败')
		}
		set({ isAuth: true, isInitialized: true })
	}
}))

useAuthStore.getState().refreshAuthState().catch(() => {})
