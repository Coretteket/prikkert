<script lang="ts">
	import Button from '@/components/button.svelte'
	import Dialog from '@/components/dialog.svelte'

	let {
		open = $bindable(false),
		onConfirm,
	}: { open: boolean; onConfirm?: (value: boolean) => void } = $props()
</script>

<Dialog bind:open>
	<div>
		<p class="mb-4 text-lg font-medium">Opties verwijderen</p>
		<p class="mb-6 text-neutral-700 dark:text-neutral-300">
			Je hebt een of meerdere datumopties aangepast. Als je doorgaat wordt de beschikbaarheid van
			deelnemers voor deze opties verwijderd. Dit kan niet ongedaan worden gemaakt.
		</p>
		<div class="flex justify-end gap-3">
			<Button
				variant="secondary"
				onclick={() => {
					onConfirm?.(false)
					open = false
				}}>Annuleren</Button
			>
			<Button
				variant="primary"
				onclick={() => {
					onConfirm?.(true)
					open = false
				}}>Verwijderen</Button
			>
		</div>
	</div>
</Dialog>
