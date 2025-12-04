<script lang="ts">
	import { tick } from 'svelte'

	import Button from '@/components/button.svelte'
	import { Temporal } from '@/shared/temporal'
	import Icon from '@/components/icon.svelte'

	import { emptySlot, type Options } from './types'

	let {
		options,
		monthsToShow = 1,
		hasIssues,
	}: { options: Options; monthsToShow?: 1 | 2; hasIssues: boolean } = $props()

	const weekdays = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']
	const now = Temporal.Now.plainDateISO('Europe/Amsterdam')

	let view = $state(now)

	const firstVisible = $derived(view.with({ day: 1 }))
	const lastVisible = $derived(
		monthsToShow === 2
			? view.add({ months: 1 }).with({ day: view.add({ months: 1 }).daysInMonth })
			: view.with({ day: view.daysInMonth }),
	)

	const isFirstMonth = $derived(firstVisible.since(now).sign <= 0)

	const months = $derived(monthsToShow === 2 ? [view, view.add({ months: 1 })] : [view])

	function getMondaysForMonth(month: Temporal.PlainDate) {
		const start = month.with({ day: 1 })
		const end = month.with({ day: start.daysInMonth })

		const mondays: Array<Temporal.PlainDate> = []
		let current = start.subtract({ days: start.dayOfWeek - 1 })

		while (Temporal.PlainDate.compare(current, end) <= 0) {
			mondays.push(current)
			current = current.add({ days: 7 })
		}

		return mondays
	}

	function toggleDate(date: Temporal.PlainDate) {
		const stringDate = date.toString()
		if (options.has(stringDate)) options.delete(stringDate)
		else options.set(stringDate, [emptySlot])
	}

	function isTabbable(day: Temporal.PlainDate, inMonth: boolean, isPast: boolean) {
		if (!inMonth || isPast) return false
		return Temporal.PlainDate.compare(day, now) === 0
	}

	const keyActions = new Map<string, (day: Temporal.PlainDate) => Temporal.PlainDate>([
		['ArrowLeft', (day) => day.subtract({ days: 1 })],
		['ArrowRight', (day) => day.add({ days: 1 })],
		['ArrowUp', (day) => day.subtract({ days: 7 })],
		['ArrowDown', (day) => day.add({ days: 7 })],
	])

	async function handleKeydown(event: KeyboardEvent, day: Temporal.PlainDate) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			if (Temporal.PlainDate.compare(day, now) >= 0) toggleDate(day)
			return
		}

		const newDate = keyActions.get(event.key)?.(day)
		if (!newDate) return

		event.preventDefault()

		if (Temporal.PlainDate.compare(newDate, now) <= 0) return

		if (Temporal.PlainDate.compare(newDate, firstVisible) < 0) {
			view = view.subtract({ months: 1 })
		} else if (Temporal.PlainDate.compare(newDate, lastVisible) > 0) {
			view = view.add({ months: 1 })
		}

		await tick()

		const target = `[data-date="${newDate.toString()}"]:not(:disabled)`
		const button = document.querySelector<HTMLButtonElement>(target)
		button?.focus()
	}
</script>

<div class={['mb-4 rounded-lg border max-w-100 sm:max-w-210', hasIssues && 'ring-2 ring-pink-500']}>
	<div class={['grid', monthsToShow === 2 && 'sm:grid-cols-2 sm:divide-x']}>
		{#each months as month, index (month)}
			<div class={['@container p-4 xs:p-5', index > 0 && 'max-sm:hidden']}>
				<div class="mb-3 flex items-center justify-between">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onclick={() => (view = view.subtract({ months: 1 }))}
						disabled={isFirstMonth}
						class={['disabled:opacity-40', index === months.length - 1 && 'sm:invisible']}
					>
						<Icon icon="tabler--chevron-left" class="size-5" />
					</Button>

					<span>{month.toLocaleString('nl', { month: 'long', year: 'numeric' })}</span>

					<Button
						type="button"
						variant="ghost"
						size="icon"
						onclick={() => (view = view.add({ months: 1 }))}
						class={[index === 0 && 'sm:invisible']}
					>
						<Icon icon="tabler--chevron-right" class="size-5" />
					</Button>
				</div>

				<table class="grid w-full table-fixed gap-4">
					<thead class="grid gap-1">
						<tr class="grid grid-cols-7 gap-1 @xs:gap-2">
							{#each weekdays as weekday (weekday)}
								<th class="text-center text-sm font-normal text-neutral-600 dark:text-neutral-400">
									{weekday}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody class="grid gap-1 @xs:gap-2">
						{#each getMondaysForMonth(month) as monday (monday)}
							<tr class="grid grid-cols-7 gap-1 @xs:gap-2">
								{#each { length: 7 }, dayIndex (dayIndex)}
									{@const day = monday.add({ days: dayIndex })}
									{@const inMonth = day.month === month.month}
									{@const isPast = Temporal.PlainDate.compare(day, now) < 0}
									{@const isSelected = options
										.keys()
										.some((key) => Temporal.PlainDate.compare(key, day) === 0)}

									<td class="relative flex aspect-square">
										<button
											type="button"
											tabindex={isTabbable(day, inMonth, isPast) ? 0 : -1}
											data-date={day.toString()}
											onclick={() => toggleDate(day)}
											onkeydown={(e) => handleKeydown(e, day)}
											aria-pressed={isSelected}
											disabled={!inMonth || isPast}
											class={[
												'flex aspect-square items-center justify-center squircle font-[350] tabular-nums motion-safe:transition',
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
										{#if Temporal.PlainDate.compare(day, now) === 0}
											<div
												class={[
													'pointer-events-none absolute top-[45%] left-1/2 -translate-x-1/2 cursor-pointer text-xl motion-safe:transition',
													isSelected
														? 'text-neutral-100'
														: 'text-neutral-700 dark:text-neutral-300',
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
			</div>
		{/each}
	</div>
</div>
