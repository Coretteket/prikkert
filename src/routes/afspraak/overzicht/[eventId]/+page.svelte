<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion'
	import * as floating from '@floating-ui/dom'
	import { cubicInOut } from 'svelte/easing'
	import { fade } from 'svelte/transition'
	import { flip } from 'svelte/animate'

	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	import { Popover } from '@/shared/popover.svelte'
	import Button from '@/components/button.svelte'
	import Icon from '@/components/icon.svelte'
	import Date from '@/components/date.svelte'

	import OrganizerReceiveDialog from './organizer-receive-dialog.svelte'
	import OrganizerShareDialog from './organizer-share-dialog.svelte'
	import EventUnselectDialog from './event-unselect-dialog.svelte'
	import EventRemoveDialog from './event-remove-dialog.svelte'
	import EventSelectDialog from './event-select-dialog.svelte'
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

	let removeDialog = $state(false)
	let shareOrganizerDialog = $state(false)
	let selectDateDialog = $state(false)

	const popover = new Popover({
		placement: 'bottom-start',
		middleware: [floating.offset({ mainAxis: 8 }), floating.shift(), floating.flip()],
	})

	const event = $derived(await getEventResponses(page.params.eventId))
	const eventLink = $derived(page.url.toString().replace('/afspraak/overzicht', ''))
	// ^ for some reason `${page.url.origin}/${page.params.eventId}` doesn't work here
</script>

<h1 class="mb-6 text-2xl font-[520] xs:text-3xl xs:font-medium">{event.title}</h1>

<p class="mb-6 text-[17px] text-balance text-neutral-700 xs:text-lg dark:text-neutral-300">
	{#if event.selectedOption}
		{#if event.isOrganizer}Je hebt deze afspraak gepland voor{:else}Deze afspraak staat gepland voor{/if}
		<strong class="font-medium text-neutral-800 dark:text-neutral-200">
			<Date option={event.selectedOption} />
		</strong>.

		{#if event.selectedOption.responses.length > 1}
			{@const total = event.selectedOption.responses.length}
			{@const available = event.selectedOption.responses.filter(
				(r) => r.availability === 'YES',
			).length}
			{@const maybe = event.selectedOption.responses.filter(
				(r) => r.availability === 'MAYBE',
			).length}

			Op deze datum {#if available === 1}is{:else}zijn{/if}
			{#if available === total}alle{:else}{available} van de {total}{/if} deelnemers beschikbaar{#if maybe > 0},
				en
				{maybe} misschien{/if}.
		{/if}
	{:else}
		{#if event.isOrganizer}
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
			Er heeft tot nu toe 1 persoon gereageerd.
		{:else}
			Er hebben tot nu toe {event.numberOfResponses} personen gereageerd.
		{/if}
	{/if}
</p>

<div class="mb-10 flex flex-wrap gap-3">
	{#if event.hasResponded && !event.selectedOption}
		<Button as="link" href="/afspraak/reageren/{event.id}" variant="secondary">
			Beschikbaarheid bewerken
		</Button>
	{:else if !event.selectedOption}
		<Button as="link" href="/afspraak/reageren/{event.id}" variant="primary">
			Beschikbaarheid invullen
		</Button>
	{/if}
	{#if event.isOrganizer}
		<Button
			variant="secondary"
			{@attach (node) => popover.triggerHandler(node)}
			{...popover.triggerAttrs}
		>
			Afspraak beheren
		</Button>

		{#if popover.isOpen}
			<div
				{@attach (node) => popover.floatingHandler(node)}
				{...popover.floatingAttrs}
				class="grid min-w-40 gap-1 rounded-lg border bg-white px-1.5 py-2 text-neutral-700 ring-4 ring-white dark:bg-neutral-850 dark:text-neutral-300 dark:ring-neutral-850"
				transition:fade={{
					duration: prefersReducedMotion.current ? 0 : 100,
					easing: cubicInOut,
				}}
			>
				{#if !event.selectedOption}
					<Button
						variant="ghost"
						size="sm"
						class="w-full!"
						onclick={() => {
							popover.close()
							selectDateDialog = true
						}}
					>
						<Icon icon="tabler--pin" class="mb-px size-5" />
						Datum bevestigen
					</Button>
					<Button
						as="link"
						href="/afspraak/bewerken/{event.id}"
						variant="ghost"
						size="sm"
						class="w-full!"
					>
						<Icon icon="tabler--edit" class="mb-px size-5" />
						Afspraak bewerken
					</Button>
				{:else}
					<Button
						variant="ghost"
						size="sm"
						class="w-full!"
						onclick={() => {
							popover.close()
							selectDateDialog = true
						}}
					>
						<Icon icon="tabler--pinned-off" class="mb-px size-5" />
						Bevestiging intrekken
					</Button>
				{/if}
				<Button
					variant="ghost"
					size="sm"
					class="w-full!"
					onclick={() => {
						popover.close()
						shareOrganizerDialog = true
					}}
				>
					<Icon icon="tabler--user-shield" class="mb-px size-5" />
					Afspraakbeheer delen
				</Button>
				<Button
					variant="ghost"
					size="sm"
					class="w-full! text-pink-600 dark:text-pink-400"
					onclick={() => {
						popover.close()
						removeDialog = true
					}}
				>
					<Icon icon="tabler--trash" class="mb-px size-5" />
					Afspraak verwijderen
				</Button>
			</div>
		{/if}

		<EventRemoveDialog bind:open={removeDialog} id={event.id} />

		<OrganizerShareDialog bind:open={shareOrganizerDialog} id={event.id} />
	{/if}

	<OrganizerReceiveDialog id={event.id} isOrganizer={event.isOrganizer} />
</div>

{#if event.description}
	<div class="mb-10">
		<p class="text-lg font-medium">Omschrijving</p>

		<p class="my-4 text-balance text-neutral-700 dark:text-neutral-300">
			{event.description}
		</p>
	</div>
{/if}

{#if event.isOrganizer && !event.selectedOption}
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
		{#if !browser || navigator.share}
			<Button
				type="button"
				size="sm"
				variant="secondary"
				onclick={() => navigator.share({ url: eventLink })}
			>
				<Icon icon="tabler--share" class="size-4.5" />
				Link delen
			</Button>
		{:else}
			<Button
				variant="secondary"
				size="sm"
				as="link"
				href="mailto:?body={encodeURIComponent(eventLink)}"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Icon icon="tabler--mail" class="size-4.5" />
				Delen via mail
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
					size="icon"
					label={allOpened ? 'Verberg alle reacties' : 'Toon alle reacties'}
					title={allOpened ? 'Verberg alle reacties' : 'Toon alle reacties'}
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
				? 'group has-[summary:hover]:bg-neutral-50 motion-safe:transition-colors dark:has-[summary:hover]:bg-neutral-800/50'
				: 'flex justify-between gap-1 p-5 max-sm:flex-col'}
			open={hasResponses ? allOpened : undefined}
			animate:flip={{ duration: 100 }}
		>
			{#if option.responses.length === 0}
				<p class="font-[450] text-neutral-800 dark:text-neutral-200">
					<Date {option} />
				</p>
				<p class="text-neutral-600 dark:text-neutral-400">Nog geen reacties</p>
			{:else}
				<summary class="flex cursor-pointer flex-col p-5 pt-4">
					<div class="mb-3 flex w-full items-center justify-between gap-3">
						<p class="font-[450] text-neutral-800 dark:text-neutral-200">
							<Date {option} />
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
							{@const percentage = (number / event.numberOfResponses) * 100}
							{#if percentage > 0}
								<div
									style="width: {percentage}%"
									class={[
										'@container shrink-0 grow-0 px-2 py-1 text-[14px] font-semibold',
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

				<div class="space-y-2 px-5 pb-4 sm:columns-2">
					{#each option.responses as response}
						<div class="flex gap-3">
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

{#if event.isOrganizer && !event.selectedOption}
	<Button
		type="submit"
		variant="primary"
		class="mt-10 ml-auto"
		onclick={() => (selectDateDialog = true)}>Datum bevestigen</Button
	>
	<EventSelectDialog bind:open={selectDateDialog} id={event.id} options={event.options} />
{/if}

{#if event.isOrganizer && event.selectedOption}
	<Button
		type="submit"
		variant="secondary"
		class="mt-10 ml-auto"
		onclick={() => (selectDateDialog = true)}>Bevestiging intrekken</Button
	>

	<EventUnselectDialog
		bind:open={selectDateDialog}
		id={event.id}
		selectedOption={event.selectedOption}
	/>
{/if}
