<script lang="ts">
	import Button from '@/components/button.svelte'
	import Dialog from '@/components/dialog.svelte'

	import { deleteAvailability } from './action.remote'

	let { open = $bindable(false) }: { open: boolean } = $props()
</script>

<Dialog bind:open>
	<form
		{...deleteAvailability.enhance(async ({ submit }) => {
			await submit()
			open = false
		})}
	>
		<p class="mb-4 text-lg font-medium">Reactie verwijderen</p>
		<p class="mb-6 text-neutral-700 dark:text-neutral-300">
			Als je doorgaat wordt je beschikbaarheid verwijderd. Je kunt daarna opnieuw reageren.
		</p>
		<div class="flex justify-end gap-3">
			<Button formmethod="dialog" variant="secondary">Annuleren</Button>
			<Button variant="primary">Verwijderen</Button>
		</div>
	</form>
</Dialog>
