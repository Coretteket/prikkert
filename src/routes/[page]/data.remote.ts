import { marked, type RendererObject } from 'marked'
import parseFrontmatter from 'front-matter'
import { error } from '@sveltejs/kit'

import { prerender } from '$app/server'

import * as v from '@/server/validation'

// Static pages (like /privacy and /voorwaarden) use content from this folder
const content = import.meta.glob('./content/*.md', {
	query: '?raw',
	import: 'default',
	eager: true,
})

const FrontmatterSchema = v.object({ title: v.string(), description: v.string() })

const renderer = {
	link(token) {
		const link = marked.Renderer.prototype.link.call(this, token)
		return link.replace('<a', '<a target="_blank"')
	},
	heading(token) {
		token.depth++ // Title is h1, so we start from h2
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
		const parsed = v.safeParse(FrontmatterSchema, frontmatter.attributes)
		if (!parsed.success) return error(500)

		const body = await marked.use({ renderer }).parse(frontmatter.body)

		return { ...parsed.output, body }
	},
	{
		dynamic: true,
		inputs: () =>
			Object.keys(content)
				.map((key) => key.match(/.\/content\/(.*)\.md/)?.[1])
				.filter((key) => key !== undefined),
	},
)
