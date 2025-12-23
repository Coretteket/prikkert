<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity'
	import { flip } from 'svelte/animate'

	import { browser, dev } from '$app/environment'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	import { formatDateTimeOption } from '@/shared/time-format'
	import Button from '@/components/button.svelte'
	import Icon from '@/components/icon.svelte'

	import { getEventResponses } from './data.remote'

	const SORT_KEY = 's'
	let sortBy = $derived(page.url.searchParams.get(SORT_KEY))

	const getAvailabilityScore = (option: (typeof event.options)[number]) => {
		const yes = option.responses.filter((r) => r.availability === 'YES').length
		const maybe = option.responses.filter((r) => r.availability === 'MAYBE').length
		return yes + maybe * 0.49 // to make sure that 1 YES outweighs 2 MAYBEs
	}

	const sortOptions = (options: typeof event.options, sortBy: string | null) => {
		return sortBy === 'b'
			? options.toSorted((a, b) => getAvailabilityScore(b) - getAvailabilityScore(a))
			: options
	}

	let allOpened = $state(false)
	let linkCopied = $state(false)

	let isMobile = new MediaQuery('max-width: 640px')

	const event = $derived(await getEventResponses(page.params.eventId))
	const eventLink = $derived(`${page.url.origin}/${event.id}`)
</script>

<h1 class="xs:text-3xl xs:font-medium mb-6 text-2xl font-[520]">{event.title}</h1>

<p class="xs:text-lg mb-6 text-[17px] text-balance text-neutral-700 dark:text-neutral-300">
	{#if event.isOwner}
		Je hebt mensen uitgenodigd om hun beschikbaarheid in te vullen.
	{:else if event.hasResponded}
		Je hebt je beschikbaarheid ingevuld voor deze afspraak.
	{:else}
		Je bent
		{#if event.organizerName}
			door
			<strong class="font-medium text-neutral-800 dark:text-neutral-200">
				{event.organizerName}
			</strong>
		{/if}
		uitgenodigd om je beschikbaarheid in te vullen.
	{/if}

	{#if event.numberOfResponses === 0}
		Nog niemand heeft gereageerd.
	{:else if event.numberOfResponses === 1 && event.hasResponded}
		Nog niemand anders heeft gereageerd.
	{:else if event.numberOfResponses === 1}
		Er heeft 1 persoon gereageerd.
	{:else}
		Er hebben {event.numberOfResponses} personen gereageerd.
	{/if}
</p>

<div class="mb-10 flex flex-wrap gap-3">
	{#if event.hasResponded}
		<Button as="link" href="/afspraak/reageren/{event.id}" variant="secondary">
			Beschikbaarheid bewerken
		</Button>
	{:else}
		<Button as="link" href="/afspraak/reageren/{event.id}" variant="primary">
			Beschikbaarheid invullen
		</Button>
	{/if}
	{#if event.isOwner}
		<Button as="link" href="/afspraak/bewerken/{event.id}" variant="secondary">
			Afspraak beheren
		</Button>
	{/if}
</div>

{#if event.description}
	<div class="mb-10">
		<p class="text-lg font-medium">Omschrijving</p>

		<p class="my-4 text-balance text-neutral-700 dark:text-neutral-300">
			{event.description}
		</p>
	</div>
{/if}

{#if event.isOwner}
	<p class="text-lg font-medium">Uitnodigen</p>

	<p class="my-4 text-balance text-neutral-700 dark:text-neutral-300">
		Nodig deelnemers uit door de link naar de afspraak te delen.
	</p>

	<div class="mb-10 flex flex-wrap gap-3">
		<Button
			variant="secondary"
			size="sm"
			onclick={() => {
				navigator.clipboard.writeText(eventLink)
				linkCopied = true
				setTimeout(() => (linkCopied = false), 1000)
			}}
		>
			<Icon icon={linkCopied ? 'tabler--copy-check' : 'tabler--copy'} class="size-4.5" />
			Link kopiëren
		</Button>
		{#if browser && isMobile.current && (dev || navigator.share)}
			<Button
				type="button"
				size="sm"
				variant="secondary"
				onclick={() => navigator.share({ url: eventLink })}
			>
				<Icon icon="tabler--share" class="size-4.5" />
				Link delen
			</Button>
		{:else if browser}
			<Button
				variant="secondary"
				size="sm"
				as="link"
				href="mailto:?body={encodeURIComponent(eventLink)}"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Icon icon="tabler--mail" class="size-4.5" />
				E-mail
			</Button>
			<Button
				variant="secondary"
				size="sm"
				as="link"
				href="https://wa.me/?text={encodeURIComponent(eventLink)}"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Icon icon="tabler--brand-whatsapp" class="size-4.5" />
				WhatsApp
			</Button>
			<Button
				variant="secondary"
				size="sm"
				as="link"
				href="fb-messenger://share?link={encodeURIComponent(eventLink)}"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Icon icon="tabler--brand-messenger" class="size-4.5" />
				Messenger
			</Button>
		{/if}
	</div>
{/if}

<div class="mb-4 flex justify-between gap-y-4 max-sm:flex-col sm:items-center">
	<p class="text-lg font-medium">Beschikbaarheid</p>

	{#if event.numberOfResponses > 0}
		<div class="flex flex-wrap items-center gap-3 text-sm">
			<span class="text-neutral-800 dark:text-neutral-300">Sorteren op</span>

			<div class="flex grow gap-3">
				<select
					bind:value={
						() => sortBy ?? 'd',
						(value) => {
							// eslint-disable-next-line svelte/prefer-svelte-reactivity
							const params = new URLSearchParams(page.url.searchParams)
							if (value === 'd') params.delete(SORT_KEY)
							else if (value) params.set(SORT_KEY, value)
							goto(`${page.url.pathname}?${params.toString()}`, {
								replaceState: true,
								noScroll: true,
							})
						}
					}
					class="squircle border px-2 py-2 text-sm dark:bg-neutral-800/50"
				>
					<option value="d" selected>Datum</option>
					<option value="b">Beschikbaarheid</option>
				</select>

				<Button
					title={allOpened ? 'Verberg alle reacties' : 'Toon alle reacties'}
					size="icon"
					variant="secondary"
					onclick={() => (allOpened = !allOpened)}
					class="ml-auto"
				>
					{#if allOpened}
						<Icon icon="tabler--arrows-minimize" class="size-4.5" />
					{:else}
						<Icon icon="tabler--arrows-maximize" class="size-4.5" />
					{/if}
				</Button>
			</div>
		</div>
	{/if}
</div>

<div class="block divide-y overflow-hidden rounded-lg border">
	{#each sortOptions(event.options, sortBy) as option (option.id)}
		{@const hasResponses = option.responses.length > 0}

		<!-- animate:flip needs to be top-level of await -->
		<svelte:element
			this={hasResponses ? 'details' : 'div'}
			class={hasResponses
				? 'group has-hover:bg-neutral-50 motion-safe:transition-colors dark:has-hover:bg-neutral-800/50'
				: 'flex justify-between gap-1 p-5 max-sm:flex-col'}
			open={hasResponses ? allOpened : undefined}
			animate:flip={{ duration: 100 }}
		>
			{#if option.responses.length === 0}
				<p class="font-[450] text-neutral-800 dark:text-neutral-200">
					{formatDateTimeOption(option)}
				</p>
				<p class="text-neutral-600 dark:text-neutral-400">Nog geen reacties.</p>
			{:else}
				<summary class="flex cursor-pointer flex-col px-5 pt-4 pb-4.5">
					<div class="mb-2.5 flex w-full items-center justify-between">
						<p class="font-[450] text-neutral-800 dark:text-neutral-200">
							{formatDateTimeOption(option)}
						</p>

						<Icon
							icon="tabler--chevron-right"
							class="size-5 text-neutral-500 group-open:rotate-90 dark:text-neutral-300"
						/>
					</div>

					<div role="progressbar" class="flex divide-x overflow-hidden rounded-lg border">
						{#each ['YES', 'MAYBE', 'NO'] as availability}
							{@const number = option.responses.filter(
								(r) => r.availability === availability,
							).length}
							{@const percentage = (number / option.responses.length) * 100}
							{#if percentage > 0}
								<div
									style="width: {percentage}%"
									class={[
										'@container shrink-0 px-1.5 py-0.5 text-[14px] font-semibold',
										{
											'bg-lime-400/60 text-lime-900 dark:bg-lime-500/30 dark:text-lime-200':
												availability === 'YES',
											'bg-amber-400/60 text-amber-900 dark:bg-amber-500/30 dark:text-amber-200':
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
												MAYBE: 'tabler--tilde',
												NO: 'tabler--x',
											}[availability]!}
											class="size-5"
										/>
										{number}
									</span>
								</div>
							{/if}
						{/each}
					</div>
				</summary>

				<div class="space-y-2 pb-3.5 sm:columns-2">
					{#each option.responses as response}
						<div class="flex gap-3 px-5">
							<Icon
								title={{ YES: 'Ja', MAYBE: 'Misschien', NO: 'Nee' }[response.availability]}
								icon={{ YES: 'tabler--check', MAYBE: 'tabler--tilde', NO: 'tabler--x' }[
									response.availability
								]}
								class={[
									'size-6',
									{
										'text-lime-600 dark:text-lime-400': response.availability === 'YES',
										'text-amber-600 dark:text-amber-400': response.availability === 'MAYBE',
										'text-red-600 dark:text-red-400': response.availability === 'NO',
									},
								]}
							/>
							<div class="flex flex-1 break-inside-avoid flex-col">
								<p
									class={['text-neutral-800 dark:text-neutral-200', !response.name && 'opacity-90']}
								>
									{response.name || 'Anonieme deelnemer'}
								</p>
								{#if response.note}
									<p
										class="text-[15px] leading-snug text-balance text-neutral-600 dark:text-neutral-400"
									>
										{response.note}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</svelte:element>
	{/each}
</div>
