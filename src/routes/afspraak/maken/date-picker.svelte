<script lang="ts">
	import { Now, PlainDate } from '@/lib/temporal'
	import type { SvelteMap } from 'svelte/reactivity'
	import { emptySlot, type Slot } from './types'

	const weekdays = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

	type Props = { options: SvelteMap<PlainDate, Array<Slot>> }
	let { options }: Props = $props()

	const now = Now.plainDateISO('Europe/Amsterdam')
	let view = $state(now)

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

	function toggleDate(date: PlainDate) {
		if (options.has(date)) options.delete(date)
		else options.set(date, [emptySlot])
	}

	function time<T>(fn: () => T): T {
		let start = performance.now()
		let x = fn()
		console.log(performance.now() - start + 'ms')
		return x
	}
</script>

<div class="grid divide-gray-300 rounded border border-gray-300 sm:grid-cols-2 sm:divide-x">
	<div class="p-5">{@render month(view)}</div>
	<div class="p-5 max-sm:hidden">{@render month(view.add({ months: 1 }))}</div>
</div>

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
					<th class="text-center text-sm font-normal text-gray-500">
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
						{@const isSelected = options.keys().some((key) => PlainDate.compare(key, day) === 0)}

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
