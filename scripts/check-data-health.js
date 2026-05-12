#!/usr/bin/env node
/*
 * Data health checker for the local Docker blog.
 * It intentionally uses only Node built-ins so it can run in production images/dev boxes.
 */

const fs = require('fs')
const path = require('path')

const root = process.cwd()
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, 'data')
const dataPublicDir = path.join(dataDir, 'public')
const dataImagesDir = path.join(dataPublicDir, 'images')
const dataBlogsDir = path.join(dataPublicDir, 'blogs')
const contentDir = path.join(dataDir, 'content')
const configDir = path.join(dataDir, 'config')
const sourcePublicDir = path.join(root, 'public')
const sourceImagesDir = path.join(sourcePublicDir, 'images')

const errors = []
const warnings = []
const info = []

function rel(filePath) {
	return path.relative(root, filePath) || filePath
}

function exists(filePath) {
	return fs.existsSync(filePath)
}

function readText(filePath) {
	return fs.readFileSync(filePath, 'utf8')
}

function readJson(filePath, fallback) {
	try {
		return JSON.parse(readText(filePath))
	} catch (error) {
		errors.push(`${rel(filePath)} 不是合法 JSON：${error.message}`)
		return fallback
	}
}

function walkFiles(dir) {
	if (!exists(dir)) return []
	const result = []
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const filePath = path.join(dir, entry.name)
		if (entry.isDirectory()) result.push(...walkFiles(filePath))
		else if (entry.isFile()) result.push(filePath)
	}
	return result
}

function visitStrings(value, visitor, trail = []) {
	if (typeof value === 'string') {
		visitor(value, trail)
		return
	}
	if (Array.isArray(value)) {
		value.forEach((item, index) => visitStrings(item, visitor, [...trail, String(index)]))
		return
	}
	if (value && typeof value === 'object') {
		Object.entries(value).forEach(([key, item]) => visitStrings(item, visitor, [...trail, key]))
	}
}

function pointer(trail) {
	return trail.length ? trail.join('.') : '<root>'
}

function localAssetExists(storagePath) {
	const clean = storagePath.replace(/^\//, '')
	if (storagePath.startsWith('/images/')) {
		return exists(path.join(dataPublicDir, clean)) || exists(path.join(sourcePublicDir, clean))
	}
	if (storagePath.startsWith('/blogs/')) {
		return exists(path.join(dataPublicDir, clean)) || exists(path.join(sourcePublicDir, clean))
	}
	return true
}

function collectMarkdownImageUrls(markdown) {
	const urls = []
	const mdImage = /!\[[^\]]*\]\(([^)]+)\)/g
	const htmlImage = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi
	let match
	while ((match = mdImage.exec(markdown))) urls.push(match[1].trim())
	while ((match = htmlImage.exec(markdown))) urls.push(match[1].trim())
	return urls
}

function checkNoBadString(value, trail, source) {
	if (value.startsWith('blob:')) errors.push(`${source}#${pointer(trail)} 含 blob 临时地址：${value}`)
	if (value.startsWith('data:image/')) errors.push(`${source}#${pointer(trail)} 含 data:image base64，应该先上传落盘`)
	if (value.includes('/api/api/')) errors.push(`${source}#${pointer(trail)} 含重复 /api/api/：${value}`)
}

function checkStoredImagePath(value, trail, source) {
	if (value.startsWith('/api/images/')) errors.push(`${source}#${pointer(trail)} 存储层不应保存 /api/images 路径：${value}`)
	if (value.startsWith('/api/blogs/')) errors.push(`${source}#${pointer(trail)} 存储层不应保存 /api/blogs 路径：${value}`)
	if ((value.startsWith('/images/') || value.startsWith('/blogs/')) && !localAssetExists(value)) {
		errors.push(`${source}#${pointer(trail)} 引用的本地资源不存在：${value}`)
	}
}

function checkJsonFile(filePath, options = {}) {
	if (!exists(filePath)) {
		warnings.push(`${rel(filePath)} 不存在`)
		return null
	}
	const data = readJson(filePath, options.fallback ?? null)
	visitStrings(data, (value, trail) => {
		checkNoBadString(value, trail, rel(filePath))
		if (options.storageLayer) checkStoredImagePath(value, trail, rel(filePath))
	})
	return data
}

function checkDataDirs() {
	for (const dir of [dataDir, dataPublicDir, dataBlogsDir, contentDir, configDir]) {
		if (!exists(dir)) warnings.push(`${rel(dir)} 不存在；首次启动应用时通常会自动初始化`)
	}
}

function checkContentAndConfig() {
	const contentFiles = ['about.json', 'projects.json', 'share.json', 'bloggers.json', 'pictures.json', 'snippets.json', 'likes.json']
	const configFiles = ['site-content.json', 'card-styles.json']
	contentFiles.forEach(name => checkJsonFile(path.join(contentDir, name), { storageLayer: true }))
	configFiles.forEach(name => checkJsonFile(path.join(configDir, name), { storageLayer: true }))
}

function checkBlogs() {
	const indexPath = path.join(dataBlogsDir, 'index.json')
	const categoriesPath = path.join(dataBlogsDir, 'categories.json')
	const index = checkJsonFile(indexPath, { storageLayer: true, fallback: [] })
	checkJsonFile(categoriesPath, { storageLayer: true, fallback: { categories: [] } })
	if (!Array.isArray(index)) return

	const seen = new Set()
	for (const [idx, item] of index.entries()) {
		const slug = String(item?.slug || '').trim()
		if (!slug) {
			errors.push(`${rel(indexPath)}#${idx}.slug 为空`)
			continue
		}
		if (seen.has(slug)) errors.push(`${rel(indexPath)} 有重复 slug：${slug}`)
		seen.add(slug)
		const blogDir = path.join(dataBlogsDir, slug)
		const fallbackBlogDir = path.join(sourcePublicDir, 'blogs', slug)
		const realBlogDir = exists(blogDir) ? blogDir : fallbackBlogDir
		if (!exists(realBlogDir)) {
			errors.push(`${rel(indexPath)} 引用的文章目录不存在：${slug}`)
			continue
		}
		const configPath = path.join(realBlogDir, 'config.json')
		const mdPath = path.join(realBlogDir, 'index.md')
		checkJsonFile(configPath, { storageLayer: true, fallback: {} })
		if (!exists(mdPath)) {
			errors.push(`${rel(realBlogDir)} 缺少 index.md`)
			continue
		}
		const markdown = readText(mdPath)
		if (markdown.includes('/api/api/')) errors.push(`${rel(mdPath)} 含重复 /api/api/`)
		if (markdown.includes('blob:')) errors.push(`${rel(mdPath)} 含 blob 临时地址`)
		if (markdown.includes('data:image/')) errors.push(`${rel(mdPath)} 含 data:image base64`)
		for (const url of collectMarkdownImageUrls(markdown)) {
			if (url.startsWith('/api/blogs/')) warnings.push(`${rel(mdPath)} markdown 建议保存 /blogs/... 而不是 /api/blogs/...：${url}`)
			if (url.startsWith('/blogs/') && !localAssetExists(url)) errors.push(`${rel(mdPath)} 引用的文章资源不存在：${url}`)
		}
	}

	const dirs = exists(dataBlogsDir) ? fs.readdirSync(dataBlogsDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name) : []
	for (const dir of dirs) {
		if (!seen.has(dir)) warnings.push(`${rel(path.join(dataBlogsDir, dir))} 存在但不在 blogs/index.json 中`)
	}
}

function checkSiteAssets() {
	for (const name of ['avatar.png', 'favicon.png']) {
		const dataPath = path.join(dataImagesDir, name)
		const sourcePath = path.join(sourceImagesDir, name)
		const fallbackPath = path.join(sourcePublicDir, name)
		if (!exists(dataPath) && !exists(sourcePath) && !exists(fallbackPath)) {
			errors.push(`站点资源 ${name} 在 data/public/images、public/images、public 根目录都不存在`)
		}
	}
}

function checkSourceDefaults() {
	for (const filePath of walkFiles(path.join(root, 'src', 'app'))) {
		if (!filePath.endsWith('.json') && !filePath.endsWith('.md')) continue
		const text = readText(filePath)
		if (text.includes('blob:')) errors.push(`${rel(filePath)} 默认源码内容含 blob 临时地址`)
		if (text.includes('/api/api/')) errors.push(`${rel(filePath)} 默认源码内容含重复 /api/api/`)
	}
}

checkDataDirs()
checkContentAndConfig()
checkBlogs()
checkSiteAssets()
checkSourceDefaults()

console.log('Data health check')
console.log(`- DATA_DIR: ${dataDir}`)
console.log(`- errors: ${errors.length}`)
console.log(`- warnings: ${warnings.length}`)

if (errors.length) {
	console.log('\nErrors:')
	errors.forEach(item => console.log(`  ✖ ${item}`))
}
if (warnings.length) {
	console.log('\nWarnings:')
	warnings.forEach(item => console.log(`  ⚠ ${item}`))
}
if (info.length) {
	console.log('\nInfo:')
	info.forEach(item => console.log(`  • ${item}`))
}

if (errors.length) process.exit(1)
console.log('\n✓ Data health check passed')
