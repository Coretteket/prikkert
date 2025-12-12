import { GITHUB_PAT, GITHUB_REPO } from '$env/static/private'
import { marked, type RendererObject } from 'marked'
import parseFrontmatter from 'front-matter'
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

const GithubAPISchema = v.array(
	v.object({ commit: v.object({ author: v.object({ date: v.string() }) }) }),
)

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

export const renderMarkdown = prerender(
	v.string(),
	async (id: string) => {
		const rawText = content[`./content/${id}.md`]
		if (!rawText || typeof rawText !== 'string') return error(404)

		const frontmatter = parseFrontmatter(rawText)
		const parsedFrontmatter = v.safeParse(FrontmatterSchema, frontmatter.attributes)

		if (!parsedFrontmatter.success) return error(500)

		const body = await marked.use({ renderer }).parse(frontmatter.body)

		const { fetch } = getRequestEvent()

		const response = await fetch(
			`https://api.github.com/repos/${GITHUB_REPO}/commits?path=${encodeURIComponent(`src/routes/[page]/content/${id}.md`)}&per_page=1`,
			{ headers: { Authorization: `Bearer ${GITHUB_PAT}` } },
		)

		const parsedResponse = v.safeParse(GithubAPISchema, await response.json())

		if (!parsedResponse.success) return { ...parsedFrontmatter.output, body }

		const date = Temporal.Instant.from(
			parsedResponse.output[0].commit.author.date,
		).toZonedDateTimeISO('Europe/Amsterdam')

		return {
			...parsedFrontmatter.output,
			body,
			lastModified: date.toLocaleString('nl', { dateStyle: 'long' }),
		}
	},
	{
		dynamic: true,
		inputs: () =>
			Object.keys(content)
				.map((key) => key.match(/.\/content\/(.*)\.md/)?.[1])
				.filter((key) => key !== undefined),
	},
)
