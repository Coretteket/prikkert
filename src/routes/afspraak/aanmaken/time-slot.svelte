<script lang="ts">
	import { PlainDate } from '@/lib/temporal'
	import { fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'
	import { store } from '@/state.svelte'
	import TimeInput from './time-input.svelte'
	import { emptySlot, type Options, type Slot } from './types'
	import Popover from '@/lib/components/popover.svelte'
	import Button from '@/lib/components/button.svelte'
	import Icon from '@/lib/components/icon.svelte'

	type Props = { date: string; options: Options }

	let { date, options }: Props = $props()

	const slots = $derived(options.get(date) ?? [])

	function setSlot(index: number, slot: Slot) {
		const updated = slots.map((s, i) => (i === index ? slot : s))
		options.set(date, updated)
	}

	function closePopover() {
		store.activePopover = null
	}
</script>

<div class="flex flex-col items-center gap-2 pb-1">
	<div class="grow py-1 font-[350] text-neutral-700 dark:text-neutral-300">
		{PlainDate.from(date).toLocaleString('nl', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})}
	</div>

	<div class="grid gap-3">
		{#each slots as slot, i (i)}
			<div class="-mr-4 flex gap-2">
				<div class="flex items-center gap-3">
					<TimeInput bind:time={() => slot[0], (time) => setSlot(i, [time, slot[1]])} />
					<span class="text-neutral-500">&mdash;</span>
					<TimeInput bind:time={() => slot[1], (time) => setSlot(i, [slot[0], time])} />
				</div>

				<Popover>
					<div
						class="grid min-w-40 rounded border bg-white p-2 text-sm text-neutral-700 shadow-sm dark:bg-neutral-900 dark:text-neutral-300"
						transition:fade={{ duration: 150, easing: cubicInOut }}
					>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							class="justify-start"
							onclick={() => {
								for (const key of options.keys()) options.set(key, slots)
								closePopover()
							}}
						>
							<Icon icon="tabler--copy" class="size-4.5" />
							Kopiëren naar alle datums
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							class="justify-start"
							onclick={() => {
								options.set(date, slots.concat([emptySlot]))
								closePopover()
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
								class="justify-start"
								onclick={() => {
									const remaining = slots.filter((_, j) => j !== i)
									options.set(date, remaining)
									closePopover()
								}}
							>
								<Icon icon="tabler--trash" class="size-4.5" />
								Tijdslot verwijderen
							</Button>
						{/if}
					</div>
				</Popover>
			</div>
		{/each}
	</div>
</div>
