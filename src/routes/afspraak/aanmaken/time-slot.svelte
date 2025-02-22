<script lang="ts">
	import { PlainDate } from '@/lib/temporal'
	import { fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'
	import { IconCopy, IconPlus, IconTrash } from '@tabler/icons-svelte'
	import { store } from '@/state.svelte'
	import TimeInput from './time-input.svelte'
	import { emptySlot, type Options, type Slot } from './types'
	import Popover from '@/lib/components/popover.svelte'

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
	<div class="grow py-1 font-[350] text-zinc-700 dark:text-zinc-300">
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
					<span class="text-zinc-500">&mdash;</span>
					<TimeInput bind:time={() => slot[1], (time) => setSlot(i, [slot[0], time])} />
				</div>

				<Popover>
					<div
						class="grid min-w-40 rounded border bg-white p-2 text-sm shadow-sm dark:bg-zinc-900"
						transition:fade={{ duration: 150, easing: cubicInOut }}
					>
						<button
							type="button"
							class="flex cursor-pointer items-center gap-2 rounded p-2 pr-3 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
							onclick={() => {
								for (const key of options.keys()) options.set(key, slots)
								closePopover()
							}}
						>
							<IconCopy size={16} />
							Kopiëren naar alle datums
						</button>
						<button
							type="button"
							class="flex cursor-pointer items-center gap-2 rounded p-2 pr-3 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
							onclick={() => {
								options.set(date, slots.concat([emptySlot]))
								closePopover()
							}}
						>
							<IconPlus size={16} />
							Nieuw tijdslot toevoegen
						</button>
						{#if slots.length > 1}
							<button
								type="button"
								class="flex cursor-pointer items-center gap-2 rounded p-2 pr-3 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
								onclick={() => {
									const remaining = slots.filter((_, j) => j !== i)
									options.set(date, remaining)
									closePopover()
								}}
							>
								<IconTrash size={16} />
								Tijdslot verwijderen
							</button>
						{/if}
					</div>
				</Popover>
			</div>
		{/each}
	</div>
</div>
