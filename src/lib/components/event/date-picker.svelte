<script lang="ts">
	import { tick } from 'svelte'

	import { page } from '$app/state'

	import { emptyEntry, type Options, type Slot } from '@/shared/event/types'
	import { KeyType, TIMEZONE } from '@/shared/utils'
	import Button from '@/components/button.svelte'
	import { Temporal } from '@/shared/temporal'
	import Icon from '@/components/icon.svelte'

	let {
		options,
		initialOptions,
		maxViewMonths = 1,
		hasIssues,
	}: {
		options: Options
		initialOptions?: Map<string, { hasTime: boolean; slots: Slot[] }>
		maxViewMonths?: 1 | 2
		hasIssues: boolean
	} = $props()

	const weekdays = $derived(
		Array.from({ length: 7 }, (_, i) =>
			Temporal.PlainDate.from('2026-02-23') // a monday
				.add({ days: i })
				.toLocaleString(page.data.locale, { weekday: 'short' }),
		),
	)

	const now = Temporal.Now.plainDateISO(TIMEZONE)

	let view = $state(now)

	const firstVisible = $derived(view.with({ day: 1 }))
	const lastVisible = $derived(
		maxViewMonths === 2
			? view.add({ months: 1 }).with({ day: view.add({ months: 1 }).daysInMonth })
			: view.with({ day: view.daysInMonth }),
	)

	const isFirstMonth = $derived(
		firstVisible.since(
			initialOptions && initialOptions.size > 0
				? Temporal.PlainDate.from(Array.from(initialOptions.keys()).toSorted()[0])
				: now,
		).sign <= 0,
	)

	const months = $derived(maxViewMonths === 2 ? [view, view.add({ months: 1 })] : [view])

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
		else options.set(stringDate, emptyEntry)
	}

	function isTabbable(day: Temporal.PlainDate, inMonth: boolean, isPast: boolean) {
		if (!inMonth || isPast) return false
		return Temporal.PlainDate.compare(day, now) === 0
	}

	const keyActions = new Map<string, (day: Temporal.PlainDate) => Temporal.PlainDate>([
		[KeyType.ArrowLeft, (day) => day.subtract({ days: 1 })],
		[KeyType.ArrowRight, (day) => day.add({ days: 1 })],
		[KeyType.ArrowUp, (day) => day.subtract({ days: 7 })],
		[KeyType.ArrowDown, (day) => day.add({ days: 7 })],
	])

	async function handleKeydown(event: KeyboardEvent, day: Temporal.PlainDate) {
		if (event.key === KeyType.Enter || event.key === ' ') {
			event.preventDefault()
			if (Temporal.PlainDate.compare(day, now) >= 0) toggleDate(day)
			return
		}

		const newDate = keyActions.get(event.key)?.(day)
		if (!newDate) return

		event.preventDefault()

		if (Temporal.PlainDate.compare(newDate, now) < 0) return

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

<div class={['mb-4 rounded-lg border', hasIssues && 'ring-2 ring-pink-500']}>
	<div class={['grid', maxViewMonths === 2 && 'sm:grid-cols-2 sm:divide-x']}>
		{#each months as month, index (month)}
			<div class="flex justify-center">
				<div
					class={['@container w-full max-w-110 shrink-0 p-4 xs:p-5', index > 0 && 'max-sm:hidden']}
				>
					<div class="mb-3 flex items-center justify-between">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							label="Vorige maand"
							onclick={() => (view = view.subtract({ months: 1 }))}
							disabled={isFirstMonth}
							class={['disabled:opacity-40', index === months.length - 1 && 'sm:invisible']}
						>
							<Icon icon="tabler--chevron-left" class="size-5" />
						</Button>

						<span>{month.toLocaleString(page.data.locale, { month: 'long', year: 'numeric' })}</span
						>

						<Button
							type="button"
							variant="ghost"
							size="icon"
							label="Volgende maand"
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
									<th
										class="text-center text-sm font-normal text-neutral-600 dark:text-neutral-400"
									>
										{weekday}
									</th>
								{/each}
							</tr>
						</thead>
						<tbody class="grid gap-1 @xs:gap-2">
							{#each getMondaysForMonth(month) as monday (monday)}
								<tr class="grid grid-cols-7 gap-1 @xs:gap-2">
									{#each { length: 7 }, dayIndex (dayIndex)}
										{@const date = monday.add({ days: dayIndex })}
										{@const inMonth = date.month === month.month}
										{@const isPast = Temporal.PlainDate.compare(date, now) < 0}
										{@const isInitial = initialOptions?.has(date.toString()) ?? false}

										<td class="relative flex aspect-square">
											<button
												type="button"
												tabindex={isTabbable(date, inMonth, isPast) ? 0 : -1}
												data-date={date.toString()}
												onclick={() => toggleDate(date)}
												onkeydown={(e) => handleKeydown(e, date)}
												aria-pressed={options.has(date.toString())}
												data-in-month={inMonth}
												disabled={!inMonth || (isPast && !isInitial)}
												class="peer flex aspect-square items-center justify-center squircle text-neutral-700 not-disabled:cursor-pointer not-data-[in-month=true]:invisible not-aria-pressed:not-disabled:hover:bg-neutral-100 disabled:text-neutral-300 aria-pressed:border aria-pressed:border-pink-900 aria-pressed:bg-pink-700 aria-pressed:font-semibold aria-pressed:text-white aria-pressed:not-disabled:hover:bg-pink-800 motion-safe:transition-all motion-safe:duration-100 dark:text-neutral-300 not-aria-pressed:not-disabled:hover:dark:bg-neutral-800 disabled:dark:text-neutral-700 aria-pressed:dark:border-pink-700 aria-pressed:dark:bg-pink-800 aria-pressed:dark:not-disabled:hover:bg-pink-700"
											>
												{date.day}
											</button>
											{#if Temporal.PlainDate.compare(date, now) === 0 && inMonth}
												<span
													aria-label="Vandaag"
													class="pointer-events-none absolute bottom-0.5 left-1/2 -translate-x-1/2 text-xl leading-none text-neutral-700 peer-aria-pressed:text-neutral-100 motion-safe:transition-colors motion-safe:duration-100 dark:text-neutral-300"
												>
													&middot;
												</span>
											{/if}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/each}
	</div>
</div>
