<script lang="ts">
	import { PlainDate, PlainTime } from '@/lib/temporal'
	import { fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'
	import { IconCopy, IconPlus, IconTrash } from '@tabler/icons-svelte'
	import Popover from './popover.svelte'
	import TimeRange from './time-range.svelte'

	type Props = { date: PlainDate; removeDate: () => void }
	let { date = $bindable(), removeDate }: Props = $props()

	let slots: Array<{ startsAt?: PlainTime; endsAt?: PlainTime }> = $state([
		{ startsAt: undefined, endsAt: undefined },
	])
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
				<TimeRange bind:range={slots[i]} />

				<Popover>
					{#snippet children(close)}
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
										{ startsAt: undefined, endsAt: undefined },
										...slots.slice(i + 1),
									]
									close()
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
									close()
								}}
							>
								<IconTrash size={16} />
								Tijdslot verwijderen
							</button>
						</div>
					{/snippet}
				</Popover>
			</div>
		{/each}
	</div>
</div>
