<script lang="ts">
	import { flip } from 'svelte/animate'

	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	import { formatDateTimeOption } from '@/shared/time-format'
	import Icon from '@/components/icon.svelte'

	import { getEventResponses } from './data.remote'

	const SORT_KEY = 's'
	let sortBy = $derived(page.url.searchParams.get(SORT_KEY))

	const event = $derived(await getEventResponses(page.params.eventId))

	const getAvailabilityScore = (option: (typeof event.options)[number]) => {
		const yes = option.responses.filter((r) => r.availability === 'YES').length
		const maybe = option.responses.filter((r) => r.availability === 'MAYBE').length
		return yes * 2 + maybe
	}

	const sortOptions = (options: typeof event.options, sortBy: string | null) => {
		return sortBy === 'b'
			? options.toSorted((a, b) => getAvailabilityScore(b) - getAvailabilityScore(a))
			: options
	}
</script>

<h1 class="font-display capitalize-first mb-6 text-2xl font-[550]">{event.title}</h1>

{#if event.description}
	<p
		class="mb-6 border-b pb-6 text-lg font-[350] text-balance text-neutral-700 dark:text-neutral-300"
	>
		{event.description}
	</p>
{/if}

<p class="mb-10 text-lg font-[350] text-balance text-neutral-700 dark:text-neutral-300">
	Je bent uitgenodigd om je beschikbaarheid in te vullen, zodat er een datum kan worden geprikt.
</p>

<div class="mb-6">
	<div class="mb-4 flex justify-between">
		<p class="font-medium">Beschikbaarheid</p>
		<div class="flex items-center gap-3 text-sm">
			<span class="text-neutral-800 dark:text-neutral-300">Sorteren op</span>
			<select
				bind:value={
					() => sortBy ?? 'd',
					(value) => {
						// eslint-disable-next-line svelte/prefer-svelte-reactivity
						const params = new URLSearchParams(page.url.searchParams)
						if (value === 'd') params.delete(SORT_KEY)
						else if (value) params.set(SORT_KEY, value)
						goto(`${page.url.pathname}?${params.toString()}`, { replaceState: true })
					}
				}
				class="rounded-lg border px-2 py-1.5 text-sm dark:bg-neutral-800/50"
			>
				<option value="d" selected>Datum</option>
				<option value="b">Beschikbaarheid</option>
			</select>
		</div>
	</div>
	<div class="mb-4 block divide-y rounded-lg border">
		{#each sortOptions(event.options, sortBy) as option (option.id)}
			<details class="group" animate:flip={{ duration: 100 }}>
				<summary
					class="flex cursor-pointer flex-col rounded-lg px-5 pt-3.5 pb-4 hover:bg-neutral-50 motion-safe:transition-colors dark:hover:bg-neutral-800/50"
				>
					<div class="mb-3 flex w-full items-center justify-between">
						<p class="font-[350] text-neutral-800 dark:text-neutral-200">
							{formatDateTimeOption(option)}
						</p>
						<Icon
							icon="tabler--chevron-right"
							class="size-5 text-neutral-500 group-open:rotate-90 motion-safe:transition dark:text-neutral-300"
						/>
					</div>
					<div role="progressbar" class="flex gap-1">
						{#each ['YES', 'MAYBE', 'NO'] as availability}
							{@const number = option.responses.filter(
								(r) => r.availability === availability,
							).length}
							{@const percentage = (number / option.responses.length) * 100}
							{#if percentage > 0}
								<div
									style="width: {percentage}%"
									class={[
										'@container shrink-0 rounded-lg border px-2 py-1 text-[15px] font-medium',
										{
											'bg-lime-400/60 text-lime-900 dark:bg-lime-500/30 dark:text-lime-200':
												availability === 'YES',
											'bg-amber-400/60 text-amber-900 dark:bg-yellow-500/30 dark:text-yellow-200':
												availability === 'MAYBE',
											'bg-red-400/60 text-red-900 dark:bg-red-500/30 dark:text-red-200':
												availability === 'NO',
										},
									]}
								>
									<span class="flex items-center gap-1.5 font-medium @max-[35px]:invisible">
										<Icon
											icon={{
												YES: 'tabler--check',
												MAYBE: 'tabler--question-mark',
												NO: 'tabler--x',
											}[availability]!}
											class="size-5.5"
										/>
										{number}
									</span>
								</div>
							{/if}
						{/each}
					</div>
				</summary>

				<div class="space-y-2 border-t py-4 sm:columns-2">
					{#each option.responses as response}
						<div class="flex gap-3 px-5">
							<Icon
								title={{
									YES: 'Ja',
									MAYBE: 'Misschien',
									NO: 'Nee',
								}[response.availability]}
								icon={{ YES: 'tabler--check', MAYBE: 'tabler--question-mark', NO: 'tabler--x' }[
									response.availability
								]}
								class={[
									'size-6',
									{
										'text-lime-600 dark:text-lime-400': response.availability === 'YES',
										'text-yellow-600 dark:text-yellow-400': response.availability === 'MAYBE',
										'text-red-600 dark:text-red-400': response.availability === 'NO',
									},
								]}
							/>
							<div class="flex flex-1 break-inside-avoid flex-col">
								<p
									class={[
										'text-neutral-800 dark:text-neutral-200',
										!response.session.name && 'font-[350] opacity-90',
									]}
								>
									{response.session.name || 'Anonieme deelnemer'}
								</p>
								{#if response.note}
									<p class="mt-0.5 text-sm text-balance text-neutral-600 dark:text-neutral-400">
										{response.note}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</details>
		{/each}
	</div>
</div>
