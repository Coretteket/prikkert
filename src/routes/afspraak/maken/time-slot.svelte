<script lang="ts">
	import { PlainDate, PlainTime } from '@/lib/temporal'
	import { fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'
	import { IconCopy, IconDotsVertical, IconPlus, IconTrash } from '@tabler/icons-svelte'
	import { store } from '@/state.svelte'
	import TimePicker from '@/lib/components/time-picker.svelte'

	type Props = { date: PlainDate; removeDate: () => void }
	let { date = $bindable(), removeDate }: Props = $props()

	let slots: Array<{ startsAt?: PlainTime; endsAt?: PlainTime }> = $state([
		{ startsAt: new PlainTime(0, 0), endsAt: new PlainTime(0, 0) },
	])

	const Popover = import('@/lib/components/popover.svelte').then((m) => m.default)
</script>

<div class="flex gap-2 max-sm:flex-col">
	<div class="grow py-1">
		{date.toLocaleString('nl', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})}
	</div>

	<div class="grid gap-3">
		{#each slots as slot, i (slot)}
			<div class="flex gap-2">
				<div class="flex items-center gap-3">
					<TimePicker bind:time={slot.startsAt} />
					&mdash;
					<TimePicker bind:time={slot.endsAt} />
				</div>

				{#await Popover}
					<button type="button" class="cursor-pointer text-stone-600">
						<IconDotsVertical size={20} />
					</button>
				{:then Popover}
					<Popover>
						<div
							class="grid min-w-40 rounded border bg-white p-2 text-sm shadow"
							transition:fade={{ duration: 150, easing: cubicInOut }}
						>
							<button
								type="button"
								class="flex cursor-pointer items-center gap-2 rounded p-2 pr-3 text-left transition hover:bg-stone-100"
							>
								<IconCopy size={16} />
								Kopiëren naar alle datums
							</button>
							<button
								type="button"
								class="flex cursor-pointer items-center gap-2 rounded p-2 pr-3 text-left transition hover:bg-stone-100"
								onclick={() => {
									slots = [
										...slots.slice(0, i + 1),
										{ startsAt: new PlainTime(0, 0), endsAt: new PlainTime(0, 0) },
										...slots.slice(i + 1),
									]
									store.activePopover = null
								}}
							>
								<IconPlus size={16} />
								Nieuw tijdslot toevoegen
							</button>
							<button
								type="button"
								class="flex cursor-pointer items-center gap-2 rounded p-2 pr-3 text-left transition hover:bg-stone-100"
								onclick={() => {
									if (slots.length > 1) slots.splice(i, 1)
									else removeDate()
									store.activePopover = null
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
