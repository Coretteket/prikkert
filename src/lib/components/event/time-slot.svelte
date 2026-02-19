<script lang="ts">
	import { emptySlot, type Options, type Slot } from '@/shared/event/types'
	import Button from '@/components/button.svelte'
	import { Temporal } from '@/shared/temporal'
	import Icon from '@/components/icon.svelte'

	import TimeInput from './time-input.svelte'

	type Props = { date: string; options: Options; isFirst: boolean }

	let { date, options, isFirst }: Props = $props()

	const entry = $derived(options.get(date))
	const hasTime = $derived(entry?.hasTime ?? false)
	const slots = $derived(
		entry?.slots.toSorted((a, b) =>
			a.startsAt && b.startsAt ? Temporal.PlainTime.compare(a.startsAt, b.startsAt) : 0,
		) ?? [emptySlot],
	)

	function updateSlot(index: number, patch: Partial<Slot>) {
		const updated = slots.map((s, i) => (i === index ? { ...s, ...patch } : s))
		options.set(date, { hasTime, slots: updated })
	}
</script>

<div class={['grow font-medium text-neutral-700 dark:text-neutral-300']}>
	{Temporal.PlainDate.from(date).toLocaleString('nl', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})}
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
					class="w-full rounded-md border px-3.5 py-2 dark:bg-neutral-800/50 dark:text-neutral-300"
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
					onclick={() => {
						if (slots.length === 1) {
							options.set(date, { hasTime: false, slots: [emptySlot] })
						} else
							options.set(date, {
								hasTime,
								slots: slots.filter((_, j) => j !== i),
							})
					}}
					label="Tijdoptie verwijderen"
				>
					<Icon icon="tabler--trash" class="size-4.5" />
				</Button>
			{/if}
		</div>
	{/each}
</div>

<div class="flex flex-wrap gap-x-3 gap-y-3">
	{#if hasTime}
		<Button
			type="button"
			variant="secondary"
			size="sm"
			onclick={() =>
				options.set(date, {
					hasTime,
					slots: slots.concat([emptySlot]),
				})}
		>
			Tijdoptie toevoegen
		</Button>
	{:else}
		<Button
			type="button"
			variant="secondary"
			size="sm"
			onclick={() => options.set(date, { hasTime: true, slots })}
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
				for (const key of options.keys()) options.set(key, { hasTime, slots })
			}}
		>
			Kopiëren naar alle datums
		</Button>
	{/if}
</div>
