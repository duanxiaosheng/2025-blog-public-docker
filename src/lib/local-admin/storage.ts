import { mkdir, readFile, readdir, rm, stat, writeFile, copyFile } from 'fs/promises'
import path from 'path'

export type BlogIndexItem = {
	slug: string
	title: string
	tags: string[]
	date: string
	summary: string
	cover?: string
	hidden?: boolean
	category?: string
}

export type BlogConfig = {
	title?: string
	date?: string
	tags?: string[]
	summary?: string
	cover?: string
	hidden?: boolean
	category?: string
}

export type AboutData = {
	title: string
	description: string
	content: string
}

const cwd = process.cwd()
const DATA_DIR = process.env.DATA_DIR || path.join(cwd, 'data')
const PUBLIC_DIR = path.join(DATA_DIR, 'public')
const BLOGS_DIR = path.join(PUBLIC_DIR, 'blogs')
const CONTENT_DIR = path.join(DATA_DIR, 'content')
const CONFIG_DIR = path.join(DATA_DIR, 'config')
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images')
const SOURCE_PUBLIC_DIR = path.join(cwd, 'public')
const SOURCE_CONTENT_DIR = path.join(cwd, 'src', 'app')
const SOURCE_CONFIG_DIR = path.join(cwd, 'src', 'config')

async function exists(target: string) {
	try {
		await stat(target)
		return true
	} catch {
		return false
	}
}

async function ensureDir(target: string) {
	await mkdir(target, { recursive: true })
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
	try {
		const raw = await readFile(filePath, 'utf8')
		return JSON.parse(raw) as T
	} catch {
		return fallback
	}
}

async function writeJsonFile(filePath: string, data: unknown) {
	await ensureDir(path.dirname(filePath))
	await writeFile(filePath, JSON.stringify(data, null, '\t'), 'utf8')
}

async function copyDirRecursive(src: string, dest: string) {
	await ensureDir(dest)
	const entries = await readdir(src, { withFileTypes: true })
	for (const entry of entries) {
		const srcPath = path.join(src, entry.name)
		const destPath = path.join(dest, entry.name)
		if (entry.isDirectory()) {
			await copyDirRecursive(srcPath, destPath)
		} else if (entry.isFile()) {
			await ensureDir(path.dirname(destPath))
			await copyFile(srcPath, destPath)
		}
	}
}

async function seedIfMissing(target: string, source: string, kind: 'dir' | 'file') {
	if (await exists(target)) return
	await ensureDir(path.dirname(target))
	if (kind === 'dir') {
		await copyDirRecursive(source, target)
	} else {
		await copyFile(source, target)
	}
}

async function seedJsonIfMissing(filePath: string, data: unknown) {
	if (await exists(filePath)) return
	await writeJsonFile(filePath, data)
}

let initialized = false

export async function ensureDataSeeded() {
	if (initialized) return
	await ensureDir(DATA_DIR)
	await ensureDir(BLOGS_DIR)
	await ensureDir(CONTENT_DIR)
	await ensureDir(CONFIG_DIR)
	await ensureDir(IMAGES_DIR)

	await seedJsonIfMissing(path.join(BLOGS_DIR, 'index.json'), [])
	await seedJsonIfMissing(path.join(BLOGS_DIR, 'categories.json'), { categories: [] })
	await seedJsonIfMissing(path.join(CONTENT_DIR, 'about.json'), { title: '', description: '', content: '' })
	await seedJsonIfMissing(path.join(CONTENT_DIR, 'projects.json'), [])
	await seedJsonIfMissing(path.join(CONTENT_DIR, 'share.json'), [])
	await seedJsonIfMissing(path.join(CONTENT_DIR, 'snippets.json'), [])
	await seedJsonIfMissing(path.join(CONTENT_DIR, 'bloggers.json'), [])
	await seedJsonIfMissing(path.join(CONTENT_DIR, 'pictures.json'), [])
	await seedJsonIfMissing(path.join(CONTENT_DIR, 'likes.json'), { counts: {} })

	await seedIfMissing(path.join(CONFIG_DIR, 'site-content.json'), path.join(SOURCE_CONFIG_DIR, 'site-content.json'), 'file')
	await seedIfMissing(path.join(CONFIG_DIR, 'card-styles.json'), path.join(SOURCE_CONFIG_DIR, 'card-styles.json'), 'file')
	initialized = true
}

export function getDataDir() {
	return DATA_DIR
}

export function getPublicDir() {
	return PUBLIC_DIR
}

export async function getBlogIndex() {
	await ensureDataSeeded()
	return readJsonFile<BlogIndexItem[]>(path.join(BLOGS_DIR, 'index.json'), [])
}

export async function saveBlogIndex(items: BlogIndexItem[]) {
	await ensureDataSeeded()
	await writeJsonFile(path.join(BLOGS_DIR, 'index.json'), items)
}

export async function getCategories() {
	await ensureDataSeeded()
	return readJsonFile<{ categories: string[] }>(path.join(BLOGS_DIR, 'categories.json'), { categories: [] })
}

export async function saveCategories(categories: string[]) {
	await ensureDataSeeded()
	await writeJsonFile(path.join(BLOGS_DIR, 'categories.json'), { categories })
}

export async function getBlog(slug: string) {
	await ensureDataSeeded()
	const blogDir = path.join(BLOGS_DIR, slug)
	const config = await readJsonFile<BlogConfig>(path.join(blogDir, 'config.json'), {})
	const markdown = await readFile(path.join(blogDir, 'index.md'), 'utf8')
	return { slug, config, markdown }
}

export async function saveBlog(params: { slug: string; originalSlug?: string | null; config: BlogConfig; markdown: string }) {
	await ensureDataSeeded()
	const { slug, originalSlug, config, markdown } = params
	const targetDir = path.join(BLOGS_DIR, slug)
	const previousSlug = originalSlug && originalSlug !== slug ? originalSlug : null
	if (previousSlug) {
		await rm(path.join(BLOGS_DIR, previousSlug), { recursive: true, force: true })
	}
	await ensureDir(targetDir)
	await writeJsonFile(path.join(targetDir, 'config.json'), config)
	await writeFile(path.join(targetDir, 'index.md'), markdown, 'utf8')
}

export async function deleteBlog(slug: string) {
	await ensureDataSeeded()
	await rm(path.join(BLOGS_DIR, slug), { recursive: true, force: true })
}

export async function readContentJson<T>(name: string, fallback: T): Promise<T> {
	await ensureDataSeeded()
	return readJsonFile<T>(path.join(CONTENT_DIR, name), fallback)
}

export async function writeContentJson(name: string, data: unknown) {
	await ensureDataSeeded()
	await writeJsonFile(path.join(CONTENT_DIR, name), data)
}

export async function readConfigJson<T>(name: string, fallback: T): Promise<T> {
	await ensureDataSeeded()
	return readJsonFile<T>(path.join(CONFIG_DIR, name), fallback)
}

export async function writeConfigJson(name: string, data: unknown) {
	await ensureDataSeeded()
	await writeJsonFile(path.join(CONFIG_DIR, name), data)
}

export async function savePublicAsset(relativePath: string, contentBase64: string) {
	await ensureDataSeeded()
	const filePath = path.join(PUBLIC_DIR, relativePath.replace(/^\//, ''))
	await ensureDir(path.dirname(filePath))
	await writeFile(filePath, Buffer.from(contentBase64, 'base64'))
}

export async function savePublicAssetBuffer(relativePath: string, buffer: Buffer) {
	await ensureDataSeeded()
	const filePath = path.join(PUBLIC_DIR, relativePath.replace(/^\//, ''))
	await ensureDir(path.dirname(filePath))
	await writeFile(filePath, buffer)
}

export async function deletePublicAsset(relativePath: string) {
	await ensureDataSeeded()
	const filePath = path.join(PUBLIC_DIR, relativePath.replace(/^\//, ''))
	await rm(filePath, { force: true })
}

export async function listPictureAssetUrlsFromData() {
	const pictures = await readContentJson<any[]>('pictures.json', [])
	const result = new Set<string>()
	for (const picture of pictures) {
		if (picture?.image) result.add(picture.image)
		if (Array.isArray(picture?.images)) {
			for (const item of picture.images) {
				if (typeof item === 'string') result.add(item)
			}
		}
	}
	return result
}

export async function ensureImageDir(subdir: string) {
	await ensureDataSeeded()
	const dir = path.join(IMAGES_DIR, subdir)
	await ensureDir(dir)
	return dir
}
