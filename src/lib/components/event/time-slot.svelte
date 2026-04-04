<script lang="ts">
	import { emptySlot, type OptionEntry, type Options, type Slot } from '@/shared/event/types'
	import Button from '@/components/button.svelte'
	import { Temporal } from '@/shared/temporal'
	import Date from '@/components/date.svelte'
	import Icon from '@/components/icon.svelte'

	import EndDateDialog from './end-date-dialog.svelte'
	import TimeInput from './time-input.svelte'

	type Props = { date: string; options: Options; isFirst: boolean }

	let { date, options, isFirst }: Props = $props()

	let endDateOpen = $state(false)

	const entry = $derived(options.get(date))
	const endDate = $derived(entry?.endDate)
	const hasTime = $derived(entry?.hasTime ?? false)
	const slots = $derived(
		entry?.slots.toSorted((a, b) =>
			a.startsAt && b.startsAt ? Temporal.PlainTime.compare(a.startsAt, b.startsAt) : 0,
		) ?? [emptySlot],
	)

	function updateEntry(patch: Partial<OptionEntry>) {
		options.set(date, {
			endDate: 'endDate' in patch ? patch.endDate : endDate,
			hasTime: patch.hasTime ?? hasTime,
			slots: patch.slots ?? slots,
		})
	}

	function updateSlot(index: number, patch: Partial<Slot>) {
		const updated = slots.map((s, i) => (i === index ? { ...s, ...patch } : s))
		options.set(date, { endDate, hasTime, slots: updated })
	}
</script>

<div class={['grow font-medium text-neutral-700 dark:text-neutral-300']}>
	<Date
		startsAt={Temporal.PlainDate.from(date)}
		endsAt={entry?.endDate ? Temporal.PlainDate.from(entry.endDate) : null}
	/>
</div>

<div class={['grid gap-4', hasTime ? 'mt-3 mb-5' : 'my-4']}>
	{#each slots as slot, i (i)}
		<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
			{#if hasTime}
				<div>
					<p class="mb-2 text-[15px] text-neutral-500 dark:text-neutral-400">Starttijd</p>
					<TimeInput bind:time={() => slot.startsAt, (time) => updateSlot(i, { startsAt: time })} />
				</div>
				<div>
					<p class="mb-2 text-[15px] text-neutral-500 dark:text-neutral-400">Eindtijd</p>
					<TimeInput bind:time={() => slot.endsAt, (time) => updateSlot(i, { endsAt: time })} />
				</div>
			{/if}
			<div class="grow">
				{#if hasTime}
					<p class="mb-2 text-[15px] text-neutral-500 dark:text-neutral-400">Opmerking</p>
				{/if}
				<input
					type="text"
					class="w-full rounded-md border px-3.5 py-2 dark:bg-neutral-825 dark:text-neutral-300"
					placeholder="Vul een opmerking in... (optioneel)"
					value={slot.note ?? ''}
					oninput={(e) => updateSlot(i, { note: e.currentTarget.value })}
				/>
			</div>
			{#if hasTime}
				<Button
					type="button"
					variant="secondary"
					size="icon"
					class="self-end p-2.75"
					onclick={() =>
						updateEntry(
							slots.length === 1
								? { hasTime: false, slots: [emptySlot] }
								: { slots: slots.filter((_, j) => j !== i) },
						)}
					label="Tijdoptie verwijderen"
				>
					<Icon icon="tabler--trash" class="size-4.5" />
				</Button>
			{/if}
		</div>
	{/each}
</div>

<div class="flex flex-wrap gap-x-3 gap-y-3">
	<Button
		type="button"
		variant="secondary"
		size="sm"
		onclick={() => {
			endDateOpen = true
		}}
	>
		{#if endDate}Einddatum aanpassen{:else}Einddatum toevoegen{/if}
	</Button>

	{#if hasTime}
		<Button
			type="button"
			variant="secondary"
			size="sm"
			onclick={() => updateEntry({ slots: slots.concat([emptySlot]) })}
		>
			Tijdoptie toevoegen
		</Button>
	{:else}
		<Button
			type="button"
			variant="secondary"
			size="sm"
			onclick={() => updateEntry({ hasTime: true })}
		>
			Tijden toevoegen
		</Button>
	{/if}

	{#if isFirst}
		<Button
			type="button"
			variant="secondary"
			size="sm"
			onclick={() => {
				for (const key of options.keys()) {
					options.set(key, {
						endDate: endDate
							? Temporal.PlainDate.from(key)
									.add(Temporal.PlainDate.from(date).until(endDate))
									.toString()
							: undefined,
						hasTime,
						slots,
					})
				}
			}}
		>
			Kopiëren naar alle datums
		</Button>
	{/if}
</div>

<EndDateDialog
	bind:open={endDateOpen}
	onConfirm={(confirm) => confirm !== false && updateEntry({ endDate: confirm })}
	{date}
	{endDate}
/>
