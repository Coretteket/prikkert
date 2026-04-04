<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity'

	import { emptyEntry, type Options } from '@/shared/event/types'
	import Button from '@/components/button.svelte'
	import Dialog from '@/components/dialog.svelte'
	import { Temporal } from '@/shared/temporal'
	import Date from '@/components/date.svelte'

	import DatePicker from './date-picker.svelte'

	let {
		open = $bindable(false),
		date,
		endDate,
		onConfirm,
	}: {
		open: boolean
		date: string
		endDate: string | undefined
		onConfirm?: (value: string | undefined | false) => void
	} = $props()

	const options: Options = new SvelteMap()

	$effect(() => {
		if (!open) options.clear()
		else if (endDate) options.set(endDate, emptyEntry)
	})

	const plainDate = $derived(Temporal.PlainDate.from(date))

	const selectedDate = $derived(Array.from(options.keys()).at(0))
</script>

<Dialog bind:open>
	<div>
		<p class="mb-4 text-lg font-medium">
			{#if endDate}Einddatum aanpassen{:else}Einddatum toevoegen{/if}
		</p>
		<p class="mb-6 text-neutral-700 dark:text-neutral-300">
			{#if endDate}
				Pas de einddatum voor deze datumoptie aan. Of klik op de geselecteerde einddatum om het te
				verwijderen.
			{:else}
				Kies een einddatum voor de optie die begint op <Date startsAt={plainDate} />.
			{/if}
		</p>

		<DatePicker {options} minDate={plainDate.add({ days: 1 })} type="single" />

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
					const selectedDate = Array.from(options.keys()).at(0)
					if (endDate === undefined && selectedDate === undefined) return
					onConfirm?.(selectedDate)
					open = false
				}}
				disabled={endDate === undefined && selectedDate === undefined}
			>
				{#if endDate && options.size === 0}Verwijderen{:else}Bevestigen{/if}
			</Button>
		</div>
	</div>
</Dialog>
