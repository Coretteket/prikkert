<script lang="ts">
	import Button from '@/lib/components/button.svelte'
	import Icon from '@/lib/components/icon.svelte'
	import { Now, PlainDate } from '@/lib/temporal'

	import { emptySlot, type Options } from './types'

	let { options }: { options: Options } = $props()

	const weekdays = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']
	const now = Now.plainDateISO('Europe/Amsterdam')

	let view = $state(now)

	const isFirstMonth = $derived(view.with({ day: 1 }).since(now).sign <= 0)

	const mondays = $derived.by(() => {
		const start = view.with({ day: 1 })
		const end = view.with({ day: start.daysInMonth })

		const mondays: Array<PlainDate> = []
		let current = start.subtract({ days: start.dayOfWeek - 1 })

		while (PlainDate.compare(current, end) <= 0) {
			mondays.push(current)
			current = current.add({ days: 7 })
		}

		return mondays
	})

	function toggleDate(date: PlainDate) {
		const stringDate = date.toString()
		if (options.has(stringDate)) options.delete(stringDate)
		else options.set(stringDate, [emptySlot])
	}
</script>

<div class="mb-3 flex items-center justify-between">
	<Button
		type="button"
		variant="ghost"
		size="icon"
		onclick={() => (view = view.subtract({ months: 1 }))}
		disabled={isFirstMonth}
		class="disabled:opacity-40"
	>
		<Icon icon="tabler--chevron-left" class="size-5" />
	</Button>
	<span>{view.toLocaleString('nl', { month: 'long', year: 'numeric' })}</span>
	<Button
		type="button"
		variant="ghost"
		size="icon"
		onclick={() => (view = view.add({ months: 1 }))}
	>
		<Icon icon="tabler--chevron-right" class="size-5" />
	</Button>
</div>

<table class="grid w-full table-fixed gap-4">
	<thead class="grid gap-1">
		<tr class="grid grid-cols-7 gap-1">
			{#each weekdays as weekday}
				<th class="text-center text-sm font-normal text-neutral-600 dark:text-neutral-400">
					{weekday}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody class="grid gap-0.5">
		{#each mondays as monday (monday)}
			<tr class="grid grid-cols-7 gap-0.5">
				{#each { length: 7 }, index (index)}
					{@const day = monday.add({ days: index })}
					{@const inMonth = day.month === view.month}
					{@const isPast = PlainDate.compare(day, now) < 0}
					{@const isSelected = options.keys().some((key) => PlainDate.compare(key, day) === 0)}

					<td class="relative flex aspect-square">
						<button
							type="button"
							tabIndex={-1}
							onclick={() => toggleDate(day)}
							disabled={!inMonth || isPast}
							class={[
								'flex aspect-square items-center justify-center rounded font-[350] tabular-nums motion-safe:transition',
								isSelected
									? 'border border-pink-800 bg-pink-700 font-semibold text-white hover:bg-pink-800 dark:border-pink-700 dark:bg-pink-800'
									: isPast
										? 'text-neutral-300 dark:text-neutral-700'
										: 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 hover:dark:bg-neutral-800',
								!isPast && 'cursor-pointer',
								!inMonth && 'invisible',
							]}
						>
							{day.day}
						</button>
						{#if PlainDate.compare(day, now) === 0}
							<div
								class={[
									'pointer-events-none absolute top-[45%] left-1/2 -translate-x-1/2 cursor-pointer text-xl motion-safe:transition',
									isSelected ? 'text-neutral-100' : 'text-neutral-700 dark:text-neutral-300',
								]}
							>
								&middot;
							</div>
						{/if}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
