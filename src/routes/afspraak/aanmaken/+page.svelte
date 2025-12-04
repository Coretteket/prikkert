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

	const nestedOptionsIssues = $derived.by(() => {
		const allIssues = createEvent.fields.allIssues() ?? []
		const optionsIssues = new SvelteMap<string, string>()

		for (const issue of allIssues) {
			if (issue.path?.[0] === 'options' && typeof issue.path[1] === 'number') {
				const dateIndex = issue.path[1]
				const dates = Array.from(options.keys()).toSorted(Temporal.PlainDate.compare)
				if (dates[dateIndex]) {
					optionsIssues.set(dates[dateIndex], issue.message)
				}
			}
		}

		return optionsIssues
	})
</script>

<h1 class="font-display mb-6 text-2xl font-[550]">Afspraak aanmaken</h1>
<p class="mb-10 text-lg font-[350] text-balance text-neutral-700 dark:text-neutral-300">
	Kies een titel en datums om te beginnen met plannen.
</p>

<form {...createEvent}>
	<div class="mb-10">
		<label>
			<span class="mb-4 block text-lg font-medium">Titel</span>
			<input
				{...createEvent.fields.title.as('text')}
				placeholder="Vul een titel in..."
				class={[
					'mb-4 block w-full rounded-lg border px-4 py-2.5 text-lg placeholder:text-base placeholder:opacity-80 dark:bg-neutral-800/50',
					(createEvent.fields.title.issues()?.length ?? 0) > 0 && 'ring-2 ring-pink-500',
				]}
			/>
		</label>
		{#each createEvent.fields.title.issues() ?? [] as issue}
			<p class="my-2 font-medium text-pink-600 dark:text-pink-500">{issue.message}</p>
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
					onclick={() => (showName = false)}
				>
					<Icon icon="tabler--x" class="size-5" />
				</Button>
			</div>
			<input
				id="name"
				{...createEvent.fields.organizerName.as('text')}
				placeholder="Vul jouw naam in..."
				class={[
					'block w-full rounded-lg border px-4 py-2.5 text-lg placeholder:text-base placeholder:opacity-80 dark:bg-neutral-800/50',
					(createEvent.fields.organizerName.issues()?.length ?? 0) > 0 && 'ring-2 ring-pink-500',
				]}
			/>
			{#each createEvent.fields.organizerName.issues() ?? [] as issue}
				<p class="my-2 font-medium text-pink-600 dark:text-pink-500">{issue.message}</p>
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
					onclick={() => (showDescription = false)}
				>
					<Icon icon="tabler--x" class="size-5" />
				</Button>
			</div>
			<textarea
				id="description"
				{...createEvent.fields.description.as('text')}
				rows={4}
				placeholder="Vul een omschrijving in..."
				class={[
					'mb-4 block w-full rounded-lg border px-4 py-2.5 placeholder:opacity-80 dark:bg-neutral-800/50',
					(createEvent.fields.description.issues()?.length ?? 0) > 0 && 'ring-2 ring-pink-500',
				]}
			></textarea>
			{#each createEvent.fields.description.issues() ?? [] as issue}
				<p class="font-medium text-pink-600 dark:text-pink-500">{issue.message}</p>
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
			hasIssues={(createEvent.fields.options.issues()?.length ?? 0) > 0}
		/>

		{#each createEvent.fields.options.issues() ?? [] as issue}
			<p class="font-medium text-pink-600 dark:text-pink-500">{issue.message}</p>
		{/each}
	</div>

	<div class="mb-10">
		{#if !showTimes}
			<Button
				type="button"
				variant="secondary"
				size="sm"
				onclick={() => (showTimes = true)}
				class="-mt-6 mb-8 text-lg"
			>
				Tijden toevoegen
			</Button>
		{:else}
			<div class="mb-4 flex items-center justify-between">
				<span class="text-lg font-medium">
					Tijden
					<span class="text-base font-normal text-neutral-500 dark:text-neutral-400">
						(optioneel)
					</span>
				</span>
				<Button type="button" variant="ghost" size="icon" onclick={() => (showTimes = false)}>
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
						<p class="text-center font-medium text-pink-600 dark:text-pink-500">
							{nestedOptionsIssues.get(date)}
						</p>
					{/if}
				{:else}
					<p
						class="text-neutral-500 py-4 text-center text-balance dark:text-neutral-400 font-[350] p-2"
					>
						Selecteer datums om tijden toe te voegen.
					</p>
				{/each}
			</div>
		{/if}
	</div>

	<input type="hidden" name="options" value={JSON.stringify(Array.from(options))} />

	<div class="mb-10">
		<p class="mb-4 block text-lg font-medium">
			Instellingen
			<span class="text-base font-normal text-neutral-500 dark:text-neutral-400">(optioneel)</span>
		</p>
		<div class="grid gap-4 rounded-lg border p-6">
			<label
				class="flex cursor-pointer items-start gap-3 font-[350] text-neutral-700 dark:text-neutral-300"
			>
				<input
					{...createEvent.fields.settings.allowAnonymous.as('checkbox')}
					class="my-[3px] size-4.5 cursor-pointer accent-pink-600 dark:accent-pink-700"
				/>

				<p>Sta deelnemers toe om anoniem te reageren</p>
			</label>
			<label
				class="flex cursor-pointer items-start gap-3 font-[350] text-neutral-700 dark:text-neutral-300"
			>
				<input
					{...createEvent.fields.settings.hideParticipants.as('checkbox')}
					class="my-[3px] size-4.5 cursor-pointer accent-pink-600 dark:accent-pink-700"
				/>

				<p>Toon reacties alleen aan de organisator</p>
			</label>
		</div>
	</div>

	<Button type="submit" variant="primary" class="ml-auto" disabled={createEvent.pending > 0}>
		Afspraak aanmaken
	</Button>
</form>
