<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity'
	import { untrack } from 'svelte'

	import { page } from '$app/state'

	import EventForm from '@/components/event-form.svelte'

	import { updateEvent } from './action.remote'
	import { getEditEvent } from './data.remote'

	const form = $derived(updateEvent.for(page.params.id!))

	const data = $derived(await getEditEvent(page.params.id!))

	// buggy behaviour related to navigation when this is put in $derived
	const options = new SvelteMap(untrack(() => data.initialValues.options))
</script>

<h1 class="mb-6 text-2xl font-[520] xs:text-3xl xs:font-medium">Afspraak bewerken</h1>

<EventForm
	{form}
	{options}
	initialValues={data.initialValues}
	hasResponses={data.hasResponses}
	isEditMode={true}
	submitLabel="Afspraak bewerken"
/>
