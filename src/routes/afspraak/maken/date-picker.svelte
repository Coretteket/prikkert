<script lang="ts">
	import { Now, PlainDate } from '@/lib/temporal'

	type Props = { selected?: Array<PlainDate> }
	let { selected = $bindable([]) }: Props = $props()

	const weekdays = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

	const now = Now.plainDateISO('Europe/Amsterdam')
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

<div class="grid sm:grid-cols-2 divide-x rounded border">
	<div class="p-5">{@render month(view)}</div>
	<div class="p-5 max-sm:hidden">{@render month(view.add({ months: 1 }))}</div>
</div>

{#each selected as date}
	<input type="hidden" name="options" value={date.toString()} />
{/each}

{#snippet month(month: PlainDate)}
	<div class="mb-2 flex justify-between px-2">
		<button type="button" onclick={() => (view = view.subtract({ months: 1 }))}>&lt;</button>
		<span>{month.toLocaleString('nl', { month: 'long', year: 'numeric' })}</span>
		<button type="button" onclick={() => (view = view.add({ months: 1 }))}>&gt;</button>
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
			{#each eachMondayOfMonth(month) as monday}
				<tr class="grid grid-cols-7 gap-3">
					{#each { length: 7 } as _, index}
						{@const day = monday.add({ days: index })}
						{@const inMonth = day.month === month.month}
						{@const isPast = PlainDate.compare(day, now) < 0}
						{@const isSelected = selected.some((d) => d.equals(day))}

						<td
							class={[
								'text-center',
								isSelected && 'bg-black text-white',
								isPast && 'text-stone-400',
								!inMonth && 'invisible	',
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
{/snippet}
