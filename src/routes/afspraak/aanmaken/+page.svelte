<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity'

	import type { Options } from '@/shared/event-types'

	import EventForm from '@/components/event/form.svelte'

	import { createEvent } from './action.remote'

	let options = new SvelteMap() satisfies Options

	// Workaround for https://github.com/sveltejs/kit/issues/14802
	const form = createEvent.for(0)
</script>

<h1 class="mb-6 text-2xl font-[520] xs:text-3xl xs:font-medium">Afspraak aanmaken</h1>
<p class="mb-10 text-[17px] text-balance text-neutral-700 xs:text-lg dark:text-neutral-300">
	Kies een titel en datums om te beginnen met plannen.
</p>

<EventForm {form} {options} />
