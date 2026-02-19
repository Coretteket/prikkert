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

const CodebergContentsSchema = v.object({ last_commit_sha: v.string() })

const CodebergCommitSchema = v.object({ sha: v.string(), created: v.string() })

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

		const filePath = `src/routes/[page]/content/${id}.md`
		const encodedPath = filePath
			.split('/')
			.map((e) => encodeURIComponent(e))
			.join('/')

		const contentsResponse = await fetch(
			`https://codeberg.org/api/v1/repos/qcoret/prikkert/contents/${encodedPath}`,
		)

		const parsedContents = v.safeParse(CodebergContentsSchema, await contentsResponse.json())

		if (!parsedContents.success) return { ...parsedFrontmatter.output, body }

		const commitResponse = await fetch(
			`https://codeberg.org/api/v1/repos/qcoret/prikkert/git/commits/${parsedContents.output.last_commit_sha}`,
		)

		const parsedCommit = v.safeParse(CodebergCommitSchema, await commitResponse.json())

		if (!parsedCommit.success) return { ...parsedFrontmatter.output, body }

		const lastModified = Temporal.Instant.from(parsedCommit.output.created)
			.toZonedDateTimeISO('Europe/Amsterdam')
			.toLocaleString('nl', { dateStyle: 'long' })

		const lastModifiedCommit = parsedCommit.output.sha

		return { ...parsedFrontmatter.output, body, lastModified, lastModifiedCommit }
	},
	{
		dynamic: true,
		inputs: () =>
			Object.keys(content)
				.map((key) => key.match(/.\/content\/(.*)\.md/)?.[1])
				.filter((key) => key !== undefined),
	},
)
