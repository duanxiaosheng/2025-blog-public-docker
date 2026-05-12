import { collectionJson, readCollection } from '@/lib/local-admin/content-repository'

export async function GET() {
	return collectionJson(await readCollection('snippets'))
}
