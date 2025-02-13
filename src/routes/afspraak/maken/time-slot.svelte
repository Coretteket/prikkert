<script lang="ts">
	import { PlainDate, PlainTime } from '@/lib/temporal'
	import { fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'
	import { IconCopy, IconDotsVertical, IconPlus, IconTrash } from '@tabler/icons-svelte'
	import { store } from '@/state.svelte'
	import TimeInput from './time-input.svelte'
	import { emptySlot, type Options, type Slot } from './types'

	type Props = { date: string; options: Options }

	let { date, options }: Props = $props()

	const slots = $derived(options.get(date) ?? [])

	function setSlot(index: number, slot: Slot) {
		const updated = slots.map((s, i) => (i === index ? slot : s))
		options.set(date, updated)
	}

	const Popover = import('@/lib/components/popover.svelte').then((m) => m.default)

	function closePopover() {
		store.activePopover = null
	}
</script>

<div class="flex gap-2 max-sm:flex-col">
	<div class="grow py-1 text-zinc-800">
		{PlainDate.from(date).toLocaleString('nl', {
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
					&mdash;
					<TimeInput bind:time={() => slot[1], (time) => setSlot(i, [slot[0], time])} />
				</div>

				{#await Popover}
					<button type="button" class="cursor-pointer text-zinc-600">
						<IconDotsVertical size={20} />
					</button>
				{:then Popover}
					<Popover>
						<div
							class="grid min-w-40 rounded border border-zinc-300 bg-white p-2 text-sm shadow"
							transition:fade={{ duration: 150, easing: cubicInOut }}
						>
							<button
								type="button"
								class="flex cursor-pointer items-center gap-2 rounded p-2 pr-3 text-left transition hover:bg-zinc-100"
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
								class="flex cursor-pointer items-center gap-2 rounded p-2 pr-3 text-left transition hover:bg-zinc-100"
								onclick={() => {
									options.set(date, slots.concat([emptySlot]))
									closePopover()
								}}
							>
								<IconPlus size={16} />
								Nieuw tijdslot toevoegen
							</button>
							<button
								type="button"
								class="flex cursor-pointer items-center gap-2 rounded p-2 pr-3 text-left transition hover:bg-zinc-100"
								onclick={() => {
									if (slots.length >= 1) {
										const remaining = slots.filter((s) => s !== slot)
										options.set(date, remaining)
									} else options.delete(date)
									closePopover()
								}}
							>
								<IconTrash size={16} />
								Tijdslot verwijderen
							</button>
						</div>
					</Popover>
				{/await}
			</div>
		{/each}
	</div>
</div>
