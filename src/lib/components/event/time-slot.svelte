<script lang="ts">
	import { emptySlot, type Options, type PartialSlot } from '@/shared/event-types'
	import { createPopover } from '@/shared/popover.svelte'
	import Button from '@/components/button.svelte'
	import { Temporal } from '@/shared/temporal'
	import Icon from '@/components/icon.svelte'

	import TimeInput from './time-input.svelte'

	type Props = { date: string; options: Options }

	let { date, options }: Props = $props()

	const slots = $derived(options.get(date) ?? [])

	function setSlot(index: number, slot: PartialSlot) {
		const updated = slots.map((s, i) => (i === index ? slot : s))
		options.set(date, updated)
	}
</script>

<div class="flex gap-2 pb-1 max-sm:flex-col max-sm:items-center">
	<div class="grow py-1 text-neutral-700 dark:text-neutral-300">
		{Temporal.PlainDate.from(date).toLocaleString('nl', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})}
	</div>

	<div class="grid gap-3">
		{#each slots as slot, i (i)}
			{@const popover = createPopover({ positionArea: 'bottom span-left' })}

			<div class="flex gap-2">
				<div class="flex items-center gap-3">
					<TimeInput bind:time={() => slot[0], (time) => setSlot(i, [time, slot[1]])} />
					<span class="text-neutral-500">&mdash;</span>
					<TimeInput bind:time={() => slot[1], (time) => setSlot(i, [slot[0], time])} />
				</div>

				<button
					type="button"
					class="flex cursor-pointer items-center text-neutral-700 dark:text-neutral-300"
					{@attach popover.triggerHandler}
					{...popover.triggerAttrs}
				>
					<Icon icon="tabler--dots-vertical" class="size-5" />
				</button>

				<div
					{@attach popover.floatingHandler}
					{...popover.floatingAttrs}
					data-popover
					class="grid min-w-40 rounded-lg border bg-white p-2 text-sm text-neutral-700 ring-4 ring-white dark:bg-neutral-850 dark:text-neutral-300 dark:ring-neutral-850"
				>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="w-full!"
						{@attach (node) => popover.closeHandler(node)}
						{...popover.closeAttrs}
						onclick={() => {
							for (const key of options.keys()) options.set(key, slots)
						}}
					>
						<Icon icon="tabler--copy" class="size-4.5" />
						Kopiëren naar alle datums
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="w-full!"
						{@attach (node) => popover.closeHandler(node)}
						{...popover.closeAttrs}
						onclick={() => {
							options.set(date, slots.concat([emptySlot]))
						}}
					>
						<Icon icon="tabler--plus" class="size-4.5" />
						Nieuw tijdslot toevoegen
					</Button>
					{#if slots.length > 1}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							class="w-full!"
							{@attach (node) => popover.closeHandler(node)}
							{...popover.closeAttrs}
							onclick={() => {
								const remaining = slots.filter((_, j) => j !== i)
								options.set(date, remaining)
							}}
						>
							<Icon icon="tabler--trash" class="size-4.5" />
							Tijdslot verwijderen
						</Button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
