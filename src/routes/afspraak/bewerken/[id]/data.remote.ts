import { error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { getRequestEvent, query } from '$app/server'

import { validateSession } from '@/server/session/validation'
import { db, schema } from '@/server/db'
import * as v from '@/server/validation'
import { omit } from '@/shared/utils'

export const getEditEvent = query(v.string(), async (eventId) => {
	const { locals } = getRequestEvent()
	const session = locals.session.organizer.get(eventId)

	if (!session || !(await validateSession(session))) {
		error(403, 'Je bent niet de organisator van deze afspraak.')
	}

	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		with: { options: { with: { responses: true } } },
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const formData = {
		id: event.id,
		title: event.title,
		description: event.description ?? '',
		organizerName: event.organizerName ?? undefined,
		options: event.options.map((o) => omit(o, 'responses', 'isSelected')),
		allowAnonymous: event.allowAnonymous,
		hideResponses: event.hideResponses,
	}

	return {
		event,
		hasResponses: event.options.some((o) => o.responses.length > 0),
		formData,
	}
})
