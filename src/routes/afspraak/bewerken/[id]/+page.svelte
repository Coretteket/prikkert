<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity'

	import { page } from '$app/state'

	import { emptySlot, type PartialSlot } from '@/shared/event-types'
	import EventForm from '@/components/event-form.svelte'
	import { Temporal } from '@/shared/temporal'

	import { updateEvent } from './action.remote'
	import { getEditEvent } from './data.remote'

	const data = $derived(await getEditEvent(page.params.id!))

	const form = $derived(updateEvent.for(data.formData.id))

	const options = $derived.by(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		let map = new Map<string, Array<PartialSlot>>()

		for (const option of data.formData.options) {
			const date = Temporal.PlainDate.from(option.startsAt).toString()

			if (
				option.startsAt instanceof Temporal.PlainDateTime &&
				option.endsAt instanceof Temporal.PlainDateTime
			) {
				const startsAt = Temporal.PlainTime.from(option.startsAt)
				const endsAt = Temporal.PlainTime.from(option.endsAt)
				if (map.has(date)) map.get(date)!.push([startsAt, endsAt])
				else map.set(date, [[startsAt, endsAt]])
			} else if (option.startsAt instanceof Temporal.PlainDateTime) {
				const startsAt = Temporal.PlainTime.from(option.startsAt)
				if (map.has(date)) map.get(date)!.push([startsAt])
				else map.set(date, [[startsAt]])
			} else {
				map.set(date, [emptySlot])
			}
		}

		return map
	})

	const initialValues = $derived({ ...data.formData, options })

	const editableOptions = $derived(new SvelteMap(options))
</script>

<h1 class="mb-6 text-2xl font-[520] xs:text-3xl xs:font-medium">Afspraak bewerken</h1>

<EventForm
	{form}
	{initialValues}
	options={editableOptions}
	isEditMode={true}
	hasResponses={data.hasResponses}
	submitLabel="Afspraak bewerken"
/>
