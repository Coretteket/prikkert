<script lang="ts">
	import { Now, PlainDate } from '@/lib/temporal'

	type Props = { selected?: Array<PlainDate> }
	let { selected = $bindable([]) }: Props = $props()

	const now = Now.plainDateISO('Europe/Amsterdam')

	const weekdays = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

	let view = $state(now)
	// let selected: Array<PlainDate> = $state([])

	function toggleDate(date: PlainDate) {
		if (selected.some((d) => d.equals(date))) selected = selected.filter((d) => !d.equals(date))
		else selected.push(date)
	}

	function eachMondayOfMonth(date: PlainDate) {
		const start = date.with({ day: 1 })
		const end = date.with({ day: start.daysInMonth })

		const mondays: Array<PlainDate> = []
		let current = start.subtract({ days: start.dayOfWeek - 1 })

		while (PlainDate.compare(current, end) <= 0) {
			mondays.push(current)
			current = current.add({ days: 7 })
		}

		return mondays
	}
</script>

<div class="grid divide-gray-300 rounded border border-gray-300 sm:grid-cols-2 sm:divide-x">
	<div class="p-5">{@render month(view)}</div>
	<div class="p-5 max-sm:hidden">{@render month(view.add({ months: 1 }))}</div>
</div>

{#each selected as date}
	<input type="hidden" name="options" value={date.toString()} />
{/each}

{#snippet month(month: PlainDate)}
	<div class="mb-3 flex justify-between px-2">
		<button type="button" onclick={() => (view = view.subtract({ months: 1 }))}>&lt;</button>
		<span>{month.toLocaleString('nl', { month: 'long', year: 'numeric' })}</span>
		<button type="button" onclick={() => (view = view.add({ months: 1 }))}>&gt;</button>
	</div>

	<table class="grid w-full table-fixed gap-4">
		<thead class="grid gap-1">
			<tr class="grid grid-cols-7 gap-1">
				{#each weekdays as weekday}
					<th class="text-center font-normal text-gray-500 text-sm">
						{weekday}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="grid gap-0.5">
			{#each eachMondayOfMonth(month) as monday (monday)}
				<tr class="grid grid-cols-7 gap-0.5">
					{#each { length: 7 }, index}
						{@const day = monday.add({ days: index })}
						{@const inMonth = day.month === month.month}
						{@const isPast = PlainDate.compare(day, now) < 0}
						{@const isSelected = selected.some((d) => d.equals(day))}

						<td class="flex aspect-square">
							<button
								type="button"
								tabIndex={-1}
								onclick={() => toggleDate(day)}
								disabled={!inMonth || isPast}
								class={[
									'flex aspect-square items-center justify-center rounded border border-gray-200 tabular-nums transition-colors',
									isSelected
										? 'border-rose-800 bg-rose-700 font-bold text-white hover:bg-rose-800'
										: isPast
											? 'text-gray-300'
											: 'text-gray-700 hover:bg-gray-100',
									!isPast && 'cursor-pointer',
									!inMonth && 'invisible',
								]}
							>
								{day.day}
							</button>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
{/snippet}
