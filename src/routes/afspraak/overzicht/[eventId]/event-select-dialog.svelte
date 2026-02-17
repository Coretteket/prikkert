<script lang="ts">
	import Button from '@/components/button.svelte'
	import Dialog from '@/components/dialog.svelte'
	import Date from '@/components/date.svelte'

	import type { getEventResponses } from './data.remote'

	import { selectDate } from './action.remote'

	let {
		id,
		options,
		open = $bindable(false),
	}: {
		id: string
		options: Awaited<ReturnType<typeof getEventResponses>>['options']
		open: boolean
	} = $props()
</script>

<Dialog bind:open>
	<form
		{...selectDate.for(id).enhance(async (form) => {
			await form.submit()
			open = false
		})}
	>
		<p class="mb-4 text-lg font-medium">Datum bevestigen</p>
		<p class="mb-4 text-neutral-700 dark:text-neutral-300">
			Selecteer een optie om de datum te prikken.
		</p>
		<select
			{...selectDate.fields.optionId.as('select')}
			class="mb-6 w-full rounded-lg border px-3 py-2.5 placeholder:opacity-80 dark:bg-[oklch(24%_0_0)]"
		>
			{#each options as option}
				<option value={option.id}>
					<Date {option} />
				</option>
			{/each}
		</select>
		<div class="flex justify-end gap-3">
			<Button formmethod="dialog" variant="secondary" autofocus>Annuleren</Button>
			<Button variant="primary">Bevestigen</Button>
		</div>
	</form>
</Dialog>
