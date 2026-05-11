export function clearAllAuthCache(): void {}
export async function hasAuth(): Promise<boolean> { return false }
export async function getAuthToken(): Promise<string> {
	throw new Error('GitHub auth has been removed in local deployment mode')
}
export async function getPemFromCache(): Promise<string | null> { return null }
export async function savePemToCache(): Promise<void> {}
