<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion'
	import * as floating from '@floating-ui/dom'
	import { cubicInOut } from 'svelte/easing'
	import { fade } from 'svelte/transition'

	import { Popover } from '@/shared/popover.svelte'
	import Button from '@/components/button.svelte'
	import { Temporal } from '@/shared/temporal'
	import Icon from '@/components/icon.svelte'

	import { emptySlot, type Options, type Slot } from './types'
	import TimeInput from './time-input.svelte'

	type Props = { date: string; options: Options }

	let { date, options }: Props = $props()

	const slots = $derived(options.get(date) ?? [])

	function setSlot(index: number, slot: Slot) {
		const updated = slots.map((s, i) => (i === index ? slot : s))
		options.set(date, updated)
	}

	const popover = new Popover({
		placement: 'bottom-end',
		middleware: [floating.offset({ mainAxis: 8 }), floating.shift(), floating.flip()],
	})
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
			<div class="flex gap-2">
				<div class="flex items-center gap-3">
					<TimeInput bind:time={() => slot[0], (time) => setSlot(i, [time, slot[1]])} />
					<span class="text-neutral-500">&mdash;</span>
					<TimeInput bind:time={() => slot[1], (time) => setSlot(i, [slot[0], time])} />
				</div>

				<button
					type="button"
					class="flex cursor-pointer items-center text-neutral-700 dark:text-neutral-300"
					{@attach (node) => popover.triggerHandler(node)}
					{...popover.triggerAttrs}
				>
					<Icon icon="tabler--dots-vertical" class="size-5" />
				</button>

				{#if popover.isOpen}
					<div
						{@attach (node) => popover.floatingHandler(node)}
						{...popover.floatingAttrs}
						class="dark:bg-neutral-850 dark:ring-neutral-850 grid min-w-40 rounded-lg border bg-white p-2 text-sm text-neutral-700 ring-4 ring-white dark:text-neutral-300"
						transition:fade={{
							duration: prefersReducedMotion.current ? 0 : 100,
							easing: cubicInOut,
						}}
					>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							class="w-full!"
							onclick={() => {
								for (const key of options.keys()) options.set(key, slots)
								popover.close()
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
							onclick={() => {
								options.set(date, slots.concat([emptySlot]))
								popover.close()
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
								onclick={() => {
									const remaining = slots.filter((_, j) => j !== i)
									options.set(date, remaining)
									popover.close()
								}}
							>
								<Icon icon="tabler--trash" class="size-4.5" />
								Tijdslot verwijderen
							</Button>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
