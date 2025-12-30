<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity'

	import Button from '@/components/button.svelte'
	import { Temporal } from '@/shared/temporal'
	import Icon from '@/components/icon.svelte'

	import type { Options } from './types'

	import DatePicker from './date-picker.svelte'
	import { createEvent } from './action.remote'
	import TimeSlot from './time-slot.svelte'

	let options = new SvelteMap() satisfies Options

	let showName = $state(false)
	let showDescription = $state(false)
	let showTimes = $state(false)
	let showSettings = $state(false)

	// Workaround for https://github.com/sveltejs/kit/issues/14802
	const form = createEvent.for(0)

	const issues = $derived(form.fields.allIssues() ?? [])

	$effect(() => {
		if (issues.length === 0) return
		document.querySelector('[data-issue]')?.parentElement?.scrollIntoView({ behavior: 'smooth' })
	})

	const nestedOptionsIssues = $derived.by(() => {
		const optionsIssues = new SvelteMap<string, string>()

		for (const issue of issues) {
			if (issue.path?.[0] === 'options' && typeof issue.path[1] === 'number') {
				const dateIndex = issue.path[1]
				const dates = Array.from(options.keys()).toSorted(Temporal.PlainDate.compare)
				if (dates[dateIndex]) optionsIssues.set(dates[dateIndex], issue.message)
			}
		}

		return optionsIssues
	})
</script>

<h1 class="xs:text-3xl xs:font-medium mb-6 text-2xl font-[520]">Afspraak aanmaken</h1>
<p class="xs:text-lg mb-10 text-[17px] text-balance text-neutral-700 dark:text-neutral-300">
	Kies een titel en datums om te beginnen met plannen.
</p>

<form {...form}>
	<input type="hidden" name="options" value={JSON.stringify(Array.from(options))} />

	<div class="mb-10">
		<label>
			<span class="mb-4 block text-lg font-medium">Titel</span>
			<input
				{...form.fields.title.as('text')}
				placeholder="Vul een titel in..."
				class={[
					'mb-4 block w-full rounded-lg border px-4 py-2.5 text-lg placeholder:text-base placeholder:opacity-80 dark:bg-neutral-800/50',
					(form.fields.title.issues()?.length ?? 0) > 0 && 'ring-2 ring-pink-500',
				]}
			/>
		</label>
		{#each form.fields.title.issues() ?? [] as issue}
			<p class="my-2 font-medium text-pink-600 dark:text-pink-500" data-issue>{issue.message}</p>
		{/each}
	</div>

	{#if showName}
		<div class="my-10">
			<div class="mb-4 flex items-center justify-between">
				<label for="name" class="text-lg font-medium">
					Naam
					<span class="text-base font-normal text-neutral-500 dark:text-neutral-400">
						(optioneel)
					</span>
				</label>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class="-my-2"
					label="Naam verbergen"
					onclick={() => (showName = false)}
				>
					<Icon icon="tabler--x" class="size-5" />
				</Button>
			</div>
			<input
				id="name"
				{...form.fields.organizerName.as('text')}
				placeholder="Vul jouw naam in..."
				class={[
					'block w-full rounded-lg border px-4 py-2.5 text-lg placeholder:text-base placeholder:opacity-80 dark:bg-neutral-800/50',
					(form.fields.organizerName.issues()?.length ?? 0) > 0 && 'ring-2 ring-pink-500',
				]}
			/>
			{#each form.fields.organizerName.issues() ?? [] as issue}
				<p class="my-2 font-medium text-pink-600 dark:text-pink-500" data-issue>{issue.message}</p>
			{/each}
		</div>
	{/if}

	{#if !showName || !showDescription}
		<div class="-mt-6 flex gap-3">
			{#if !showName}
				<Button type="button" variant="secondary" size="sm" onclick={() => (showName = true)}>
					Naam toevoegen
				</Button>
			{/if}
			{#if !showDescription}
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onclick={() => (showDescription = true)}
				>
					Omschrijving toevoegen
				</Button>
			{/if}
		</div>
	{/if}

	{#if showDescription}
		<div class="my-10">
			<div class="mb-4 flex items-center justify-between">
				<label for="description" class="text-lg font-medium">
					Omschrijving
					<span class="text-base font-normal text-neutral-500 dark:text-neutral-400">
						(optioneel)
					</span>
				</label>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class="-my-2"
					label="Omschrijving verbergen"
					onclick={() => (showDescription = false)}
				>
					<Icon icon="tabler--x" class="size-5" />
				</Button>
			</div>
			<textarea
				id="description"
				{...form.fields.description.as('text')}
				rows={4}
				placeholder="Vul een omschrijving in..."
				class={[
					'mb-4 block w-full rounded-lg border px-4 py-2.5 placeholder:opacity-80 dark:bg-neutral-800/50',
					(form.fields.description.issues()?.length ?? 0) > 0 && 'ring-2 ring-pink-500',
				]}
			></textarea>
			{#each form.fields.description.issues() ?? [] as issue}
				<p class="font-medium text-pink-600 dark:text-pink-500" data-issue>{issue.message}</p>
			{/each}
		</div>
	{/if}

	<div class="my-10">
		<p class="mb-4 block text-lg font-medium">
			Datums
			{#if options.size > 0}
				<span class="text-base font-normal text-neutral-500 dark:text-neutral-400">
					({options.size} geselecteerd)
				</span>
			{/if}
		</p>

		<DatePicker
			{options}
			monthsToShow={2}
			hasIssues={(form.fields.options.issues()?.length ?? 0) > 0}
		/>

		{#each form.fields.options.issues() ?? [] as issue}
			<p class="font-medium text-pink-600 dark:text-pink-500" data-issue>{issue.message}</p>
		{/each}
	</div>

	<div class="mb-10">
		{#if showTimes}
			<div class="mb-4 flex items-center justify-between">
				<span class="text-lg font-medium">
					Tijden
					<span class="text-base font-normal text-neutral-500 dark:text-neutral-400">
						(optioneel)
					</span>
				</span>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					label="Tijden verbergen"
					onclick={() => (showTimes = false)}
				>
					<Icon icon="tabler--x" class="size-5" />
				</Button>
			</div>
			<div
				class={[
					'relative mb-4 max-h-80 space-y-3 overflow-y-auto rounded-lg border px-6 py-5 [scrollbar-gutter:stable] sm:max-h-64',
					nestedOptionsIssues.size > 0 && 'ring-2 ring-pink-500',
				]}
			>
				{#each Array.from(options.keys()).toSorted(Temporal.PlainDate.compare) as date}
					<TimeSlot {date} {options} />
					{#if nestedOptionsIssues.has(date)}
						<p class="text-center font-medium text-pink-600 dark:text-pink-500" data-issue>
							{nestedOptionsIssues.get(date)}
						</p>
					{/if}
				{:else}
					<p class="text-neutral-500 py-4 text-center text-balance dark:text-neutral-400 p-2">
						Selecteer datums om tijden toe te voegen.
					</p>
				{/each}
			</div>
		{/if}
	</div>

	{#if !showTimes || !showSettings}
		<div class="-mt-6 mb-8 flex gap-3">
			{#if !showTimes}
				<Button type="button" variant="secondary" size="sm" onclick={() => (showTimes = true)}>
					Tijden toevoegen
				</Button>
			{/if}
			{#if !showSettings}
				<Button type="button" variant="secondary" size="sm" onclick={() => (showSettings = true)}>
					Instellingen aanpassen
				</Button>
			{/if}
		</div>
	{/if}

	{#if showSettings}
		<div class="mb-10">
			<div class="mb-4 flex items-center justify-between">
				<span class="text-lg font-medium">
					Instellingen
					<span class="text-base font-normal text-neutral-500 dark:text-neutral-400">
						(optioneel)
					</span>
				</span>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					label="Instellingen verbergen"
					onclick={() => (showSettings = false)}
				>
					<Icon icon="tabler--x" class="size-5" />
				</Button>
			</div>
			<div class="grid gap-4 rounded-lg border p-6">
				<label class="flex cursor-pointer items-start gap-3">
					<input
						{...form.fields.hideResponses.as('checkbox')}
						class="my-[3px] size-4.5 shrink-0 cursor-pointer accent-pink-600 dark:accent-pink-700"
					/>

					<p class="font-medium text-neutral-700 dark:text-neutral-300">
						Toon reacties van deelnemers alleen aan de organisator
					</p>
				</label>

				<label class="flex cursor-pointer items-start gap-3">
					<input
						{...form.fields.allowAnonymous.as('checkbox')}
						class="my-[3px] size-4.5 shrink-0 cursor-pointer accent-pink-600 dark:accent-pink-700"
					/>

					<p class="font-medium text-neutral-700 dark:text-neutral-300">
						Sta deelnemers toe om anoniem te reageren
					</p>
				</label>

				<p class="text-[15px] text-neutral-600/80 dark:text-neutral-400/80">
					Lees meer over deze instellingen in de
					<a href="/privacy#persoonsgegevens" target="_blank" class="underline">
						privacyverklaring
					</a>.
				</p>
			</div>
		</div>
	{/if}

	<Button type="submit" variant="primary" class="ml-auto" disabled={form.pending > 0}>
		Afspraak aanmaken
	</Button>
</form>
