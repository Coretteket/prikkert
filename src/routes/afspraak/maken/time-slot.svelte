<script lang="ts">
	import { PlainDate, PlainTime } from '@/lib/temporal'
	import { fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'
	import { IconCopy, IconDotsVertical, IconPlus, IconTrash } from '@tabler/icons-svelte'
	import { store } from '@/state.svelte'
	import TimeInput from './time-input.svelte'
	import { emptySlot, type Options, type Slot } from './types'

	type Props = { date: PlainDate; options: Options }

	let { date, options }: Props = $props()

	const slots = $derived(options.get(date) ?? [])

	function setSlot(slot: Slot, key: 'startsAt' | 'endsAt', time: PlainTime | undefined) {
		const updated = slots.map((s) => (s === slot ? { ...s, [key]: time } : s))
		options.set(date, updated)
	}

	const Popover = import('@/lib/components/popover.svelte').then((m) => m.default)

	function closePopover() {
		store.activePopover = null
	}
</script>

<div class="flex max-w-md gap-2 max-sm:flex-col">
	<div class="grow py-1 text-stone-800">
		{date.toLocaleString('nl', {
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
					<TimeInput bind:time={() => slot.startsAt, (time) => setSlot(slot, 'startsAt', time)} />
					&mdash;
					<TimeInput bind:time={() => slot.endsAt, (time) => setSlot(slot, 'endsAt', time)} />
				</div>

				{#await Popover}
					<button type="button" class="cursor-pointer text-gray-600">
						<IconDotsVertical size={20} />
					</button>
				{:then Popover}
					<Popover>
						<div
							class="grid min-w-40 rounded border border-gray-300 bg-white p-2 text-sm shadow"
							transition:fade={{ duration: 150, easing: cubicInOut }}
						>
							<button
								type="button"
								class="flex cursor-pointer items-center gap-2 rounded p-2 pr-3 text-left transition hover:bg-gray-100"
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
								class="flex cursor-pointer items-center gap-2 rounded p-2 pr-3 text-left transition hover:bg-gray-100"
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
								class="flex cursor-pointer items-center gap-2 rounded p-2 pr-3 text-left transition hover:bg-gray-100"
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
