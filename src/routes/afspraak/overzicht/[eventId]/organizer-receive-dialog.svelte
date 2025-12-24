<script lang="ts">
	import { onMount } from 'svelte'

	import { goto } from '$app/navigation'

	import Dialog from '@/components/dialog.svelte'
	import Button from '@/components/button.svelte'

	import { validateOrganizerShareLink } from './action.remote'

	let { id, isOrganizer }: { id: string; isOrganizer: boolean } = $props()

	let token: string | undefined = $state()

	onMount(() => {
		const hash = new URLSearchParams(location.hash.slice(1))
		goto(`/afspraak/overzicht/${id}`, { replaceState: true, noScroll: true })
		if (isOrganizer) return
		token = hash.get('organisator') ?? undefined
	})

	$effect(() => {
		if (isOrganizer) token = undefined
	})
</script>

<Dialog open={token !== undefined}>
	<form {...validateOrganizerShareLink.for(id)}>
		<input type="hidden" name="token" value={token} />

		<p class="mb-4 text-lg font-medium">Afspraakbeheerder worden</p>
		<p class="mb-6 text-neutral-700 dark:text-neutral-300">
			Als je doorgaat word je mede-beheerder van deze afspraak. Je kunt de afspraak dan bijvoorbeeld
			bewerken of verwijderen.
		</p>

		<div class="flex justify-end gap-3">
			<Button formmethod="dialog" variant="secondary">Annuleren</Button>
			<Button variant="primary">Doorgaan</Button>
		</div>
	</form>
</Dialog>
