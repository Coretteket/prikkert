<script lang="ts">
	import { Now, PlainDate } from '@/lib/temporal'
	import { emptySlot, type Options, type Slot } from './types'
	import { IconChevronLeft, IconChevronRight } from '@tabler/icons-svelte'

	const weekdays = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

	type Props = { options: Options }
	let { options }: Props = $props()

	const now = Now.plainDateISO('Europe/Amsterdam')
	let view = $state(now)

	const isFirstMonth = $derived(view.with({ day: 1 }).since(now).sign <= 0)

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
		if (options.has(date.toString())) options.delete(date.toString())
		else options.set(date.toString(), [emptySlot])
	}

	$inspect(options)
</script>

<!-- <div class="grid divide-zinc-300 rounded border sm:grid-cols-2 sm:divide-x dark:divide-zinc-700">
	<div class="p-5">{@render month(view)}</div>
	<div class="p-5 max-sm:hidden">{@render month(view.add({ months: 1 }))}</div>
</div>

{#snippet month(month: PlainDate)} -->
	<div class="mb-3 flex justify-between px-2">
		<button
			type="button"
			onclick={() => (view = view.subtract({ months: 1 }))}
			disabled={isFirstMonth}
			class="not-disabled:cursor-pointer disabled:text-zinc-300 dark:disabled:text-zinc-700"
		>
			<IconChevronLeft class="size-4.5" />
		</button>
		<span>{view.toLocaleString('nl', { month: 'long', year: 'numeric' })}</span>
		<button type="button" onclick={() => (view = view.add({ months: 1 }))} class="cursor-pointer">
			<IconChevronRight class="size-4.5" />
		</button>
	</div>

	<table class="grid w-full table-fixed gap-4">
		<thead class="grid gap-1">
			<tr class="grid grid-cols-7 gap-1">
				{#each weekdays as weekday}
					<th class="text-center text-sm font-normal text-zinc-500">
						{weekday}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="grid gap-0.5">
			{#each eachMondayOfMonth(view) as monday (monday)}
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
									'flex aspect-square items-center justify-center rounded font-[350] tabular-nums transition',
									isSelected
										? 'border-pink-800 bg-pink-700 font-semibold text-white hover:bg-pink-800 dark:border-pink-800 dark:bg-pink-900'
										: isPast
											? 'text-zinc-300 dark:text-zinc-700'
											: 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 hover:dark:bg-zinc-800',
									!isPast && 'cursor-pointer',
									!inMonth && 'invisible',
								]}
							>
								{day.day}
							</button>
							{#if PlainDate.compare(day, now) === 0}
								<div
									class={[
										'pointer-events-none absolute top-[45%] left-1/2 -translate-x-1/2 cursor-pointer text-xl transition',
										isSelected ? 'text-zinc-100' : 'text-zinc-700 dark:text-zinc-300',
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
<!-- {/snippet} -->
