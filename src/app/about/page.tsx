import { readContentJson } from '@/lib/local-admin/storage'
import { type AboutData } from './services/push-about'
import AboutClient from './page-client'

export default async function Page() {
	const data = await readContentJson<AboutData>('about.json', { title: '', description: '', content: '' })
	return <AboutClient initialData={data} />
}
