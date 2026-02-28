<script lang="ts">
	import Button from '@/components/button.svelte'
	import Dialog from '@/components/dialog.svelte'

	let {
		message,
		open = $bindable(false),
		onConfirm,
	}: { message: string; open: boolean; onConfirm?: (value: boolean) => void } = $props()
</script>

<Dialog bind:open>
	<div>
		<p class="mb-4 text-lg font-medium">Waarschuwing</p>
		<p class="mb-6 text-neutral-700 dark:text-neutral-300">
			{message}
		</p>
		<div class="flex justify-end gap-3">
			<Button
				variant="secondary"
				onclick={() => {
					onConfirm?.(false)
					open = false
				}}
			>
				Annuleren
			</Button>
			<Button
				variant="primary"
				onclick={() => {
					onConfirm?.(true)
					open = false
				}}
			>
				Bevestigen
			</Button>
		</div>
	</div>
</Dialog>
