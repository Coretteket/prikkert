import { marked, type RendererObject } from 'marked'
import parseFrontmatter from 'front-matter'
import { XMLParser } from 'fast-xml-parser'
import { error } from '@sveltejs/kit'

import { getRequestEvent, prerender } from '$app/server'

import { Temporal } from '@/shared/temporal'
import * as v from '@/server/validation'

// Static pages (like /privacy and /voorwaarden) use content from this folder
const content = import.meta.glob('./content/*.md', {
	query: '?raw',
	import: 'default',
	eager: true,
})

const FrontmatterSchema = v.object({ title: v.string(), description: v.string() })

const FeedSchema = v.object({
	rss: v.object({
		channel: v.object({
			item: v.array(v.object({ link: v.string(), pubDate: v.string() })),
		}),
	}),
})

const renderer = {
	link(token) {
		const link = marked.Renderer.prototype.link.call(this, token)
		return link.replace('<a', '<a target="_blank"')
	},
	heading(token) {
		const heading = marked.Renderer.prototype.heading.call(this, token)
		return heading.replace('<h2', `<h2 id="${token.text.toLowerCase().replaceAll(/\s+/g, '-')}"`)
	},
} satisfies RendererObject

async function renderMarkdown(page: string) {
	const rawText = content[`./content/${page}.md`]
	if (!rawText || typeof rawText !== 'string') return error(404)

	const frontmatter = parseFrontmatter(rawText)
	const parsedFrontmatter = v.safeParse(FrontmatterSchema, frontmatter.attributes)

	if (!parsedFrontmatter.success) return error(500)

	const body = await marked.use({ renderer }).parse(frontmatter.body)

	return { ...parsedFrontmatter.output, body }
}

async function getLastCommit(page: string) {
	const { fetch } = getRequestEvent()

	const filePath = `src/routes/[page]/content/${page}.md`
	const encodedPath = filePath
		.split('/')
		.map((e) => encodeURIComponent(e))
		.join('/')

	const contentsResponse = await fetch(
		`https://codeberg.org/qcoret/prikkert/rss/branch/main/${encodedPath}`,
	)

	const parser = new XMLParser({ isArray: (name) => name === 'item' })

	const feed = parser.parse(await contentsResponse.text())
	const parsedFeed = v.safeParse(FeedSchema, feed)

	if (!parsedFeed.success) return {}

	const lastCommit = parsedFeed.output.rss.channel.item[0]

	const lastModified = Temporal.Instant.fromEpochMilliseconds(Date.parse(lastCommit.pubDate))
		.toZonedDateTimeISO('Europe/Amsterdam')
		.toLocaleString('nl', { dateStyle: 'long' })

	const link = `${lastCommit.link}?files=${encodedPath}`

	return { lastModified, link }
}

export const getPage = prerender(
	v.string(),
	async (id: string) => {
		const { body, title, description } = await renderMarkdown(id)
		const { lastModified, link } = await getLastCommit(id)
		return { body, title, description, lastModified, link }
	},
	{
		dynamic: true,
		inputs: () =>
			Object.keys(content)
				.map((key) => key.match(/.\/content\/(.*)\.md/)?.[1])
				.filter((key) => key !== undefined),
	},
)
