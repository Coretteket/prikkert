<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity'

	import { page } from '$app/state'

	import type { Options } from '@/shared/event-types'

	import EventForm from '@/components/event-form.svelte'
	import { Temporal } from '@/shared/temporal'

	import { updateEvent } from './action.remote'
	import { getEditEvent } from './data.remote'

	const data = $derived(await getEditEvent(page.params.id!))

	const revivedOptionsEntries = $derived.by(() => {
		return data.formData.options.map(([dateStr, slots]) => {
			const revivedSlots = slots.map((slot) => {
				if (slot.length === 0) return []
				const start = slot[0] ? Temporal.PlainTime.from(slot[0]) : undefined
				const end = slot[1] ? Temporal.PlainTime.from(slot[1]) : undefined
				return [start, end]
			})
			return [dateStr, revivedSlots] as const
		})
	})

	const initialValues = $derived({
		...data.formData,
		options: JSON.stringify(data.formData.options),
	})

	const form = $derived(updateEvent.for(initialValues.id))
	const options = $derived(new SvelteMap(revivedOptionsEntries) as Options)
	const initialOptions = $derived(new SvelteMap(revivedOptionsEntries) as Options)
</script>

<h1 class="mb-6 text-2xl font-[520] xs:text-3xl xs:font-medium">Afspraak bewerken</h1>

<EventForm
	{form}
	{options}
	{initialOptions}
	{initialValues}
	isEditMode={true}
	hasResponses={data.hasResponses}
	submitLabel="Afspraak bijwerken"
/>
