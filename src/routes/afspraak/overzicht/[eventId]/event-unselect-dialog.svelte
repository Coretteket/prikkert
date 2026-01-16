<script lang="ts">
	import { formatDateTimeOption } from '@/shared/time-format'
	import Button from '@/components/button.svelte'
	import Dialog from '@/components/dialog.svelte'

	import type { getEventResponses } from './data.remote'

	import { unselectDate } from './action.remote'

	let {
		id,
		selectedOption,
		open = $bindable(false),
	}: {
		id: string
		selectedOption: NonNullable<Awaited<ReturnType<typeof getEventResponses>>['selectedOption']>
		open: boolean
	} = $props()

	const formattedOption = $derived(formatDateTimeOption(selectedOption))
</script>

<Dialog bind:open>
	<form
		{...unselectDate.for(id).enhance(async (form) => {
			await form.submit()
			open = false
		})}
	>
		<p class="mb-4 text-lg font-medium">Bevestiging intrekken</p>
		<p class="mb-6 text-neutral-700 dark:text-neutral-300">
			Als je doorgaat wordt de geprikte datum niet meer <strong
				class="font-medium text-neutral-800 dark:text-neutral-200"
			>
				{formattedOption.date}{#if formattedOption.time}{formattedOption.time}{/if}
			</strong>. Je kunt later opnieuw een datum prikken.
		</p>
		<div class="flex justify-end gap-3">
			<Button formmethod="dialog" variant="secondary">Annuleren</Button>
			<Button variant="primary">Bevestigen</Button>
		</div>
	</form>
</Dialog>
