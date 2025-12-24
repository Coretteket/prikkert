<script lang="ts">
	import Button from '@/components/button.svelte'
	import Dialog from '@/components/dialog.svelte'

	import { removeEvent } from './action.remote'

	let { id, open = $bindable(false) }: { id: string; open: boolean } = $props()
</script>

<Dialog
	bind:open
	class="dark:bg-neutral-850 fixed top-1/2 left-1/2 w-full -translate-1/2 rounded-lg border bg-white p-5 backdrop:bg-black/50 sm:max-w-md sm:p-6"
>
	<form {...removeEvent.for(id)}>
		<p class="mb-4 text-lg font-medium">Afspraak verwijderen</p>
		<p class="mb-6 text-neutral-700 dark:text-neutral-300">
			Als je doorgaat worden deze afspraak en alle bijbehorende reacties verwijderd. Dit kan niet
			ongedaan worden gemaakt.
		</p>
		<div class="flex justify-end gap-3">
			<Button formmethod="dialog" variant="secondary">Annuleren</Button>
			<Button variant="primary">Verwijderen</Button>
		</div>
	</form>
</Dialog>
