<script lang="ts">
	import { Now, PlainDate } from '@/lib/temporal'

	type Props = { selected?: Array<PlainDate> }
	let { selected = $bindable([]) }: Props = $props()

	const weekdays = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

	let view = $state(Now.plainDateISO('Europe/Amsterdam'))
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

<div class="mb-2 flex justify-between px-4">
	<button type="button" onclick={() => (view = view.subtract({ months: 1 }))}> &lt; </button>
	<span>{view.toLocaleString('nl', { month: 'long', year: 'numeric' })}</span>
	<button type="button" onclick={() => (view = view.add({ months: 1 }))}> &gt; </button>
</div>

<table class="grid w-full table-fixed gap-4">
	<thead class="grid gap-4">
		<tr class="grid grid-cols-7 gap-3">
			{#each weekdays as weekday}
				<th class="text-center">
					{weekday}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody class="grid gap-4">
		{#each eachMondayOfMonth(view) as monday}
			<tr class="grid grid-cols-7 gap-3">
				{#each { length: 7 } as _, index}
					{@const day = monday.add({ days: index })}
					{@const inMonth = day.month === view.month}
					{@const isSelected = selected.some((d) => d.equals(day))}

					<td
						class={[
							'text-center',
							isSelected && 'bg-black text-white',
							!inMonth && 'text-stone-400',
						]}
					>
						<button
							type="button"
							tabIndex={-1}
							onclick={() => toggleDate(day)}
							class="cursor-pointer"
						>
							{day.day}
						</button>
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

{#each selected as date}
	<input type="hidden" name="options" value={date.toString()} />
{/each}
