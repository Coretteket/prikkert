<script lang="ts">
	import type { RemoteForm } from '@sveltejs/kit'

	import { SvelteMap } from 'svelte/reactivity'

	import type { Options, PartialSlot } from '@/shared/event-types'

	import Button from '@/components/button.svelte'
	import Dialog from '@/components/dialog.svelte'
	import { Temporal } from '@/shared/temporal'
	import Icon from '@/components/icon.svelte'

	import DatePicker from './date-picker.svelte'
	import TimeSlot from './time-slot.svelte'

	type FormFieldInput = {
		id?: string | 0 | undefined
		title: string
		description?: string | undefined
		organizerName?: string | undefined
		options: string
		allowAnonymous?: boolean | undefined
		hideResponses?: boolean | undefined
	}

	let {
		form,
		options = $bindable(),
		initialOptions,
		initialValues,
		isEditMode = false,
		hasResponses = false,
		submitLabel = 'Afspraak aanmaken',
	}: {
		form: Omit<RemoteForm<FormFieldInput, unknown>, 'for'>
		options: Options
		initialOptions?: Options
		initialValues?: FormFieldInput
		isEditMode?: boolean
		hasResponses?: boolean
		submitLabel?: string
	} = $props()

	let showName = $derived(Boolean(initialValues?.organizerName))
	let showDescription = $derived(Boolean(initialValues?.description))
	let showTimes = $derived(
		Array.from(initialOptions?.values() ?? []).some((slots) => slots.some((s) => s[0] || s[1])),
	)
	let showSettings = $derived(
		Boolean(initialValues?.hideResponses) || Boolean(initialValues?.allowAnonymous),
	)

	let showConfirmation = $state(false)
	let formElement: HTMLFormElement | undefined = $state()
	let confirmed = $state(false)

	// Workaround for scrolling to issues
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

	function compareSlots(a: PartialSlot, b: PartialSlot) {
		const aStart = a[0]?.toString()
		const bStart = b[0]?.toString()
		const aEnd = a[1]?.toString()
		const bEnd = b[1]?.toString()
		return aStart === bStart && aEnd === bEnd
	}

	function checkIfOptionsRemoved() {
		if (!initialOptions) return false

		for (const [date, slots] of initialOptions) {
			if (!options.has(date)) return true
			const currentSlots = options.get(date)!

			for (const slot of slots) {
				const found = currentSlots.some((s) => compareSlots(s, slot))
				if (!found) return true
			}
		}
		return false
	}

	function handleSubmit(e: Event) {
		if (confirmed) return
		if (!isEditMode) return

		if (checkIfOptionsRemoved()) {
			e.preventDefault()
			showConfirmation = true
		}
	}

	function confirmSubmit() {
		confirmed = true
		setTimeout(() => formElement?.requestSubmit(), 0)
		showConfirmation = false
	}

	const hideResponsesLocked = $derived(hasResponses && Boolean(initialValues?.hideResponses))

	$inspect(JSON.stringify(Array.from(options.entries())))
</script>

<form {...form.enhance((form) => form.submit())} bind:this={formElement} onsubmit={handleSubmit}>
	<input type="hidden" name="options" value={JSON.stringify(Array.from(options))} />
	{#if typeof form.fields['id'].value() === 'string' || typeof form.fields['id'].value() === 'number'}
		<input type="hidden" name="id" value={String(form.fields['id'].value())} />
	{/if}

	<div class="mb-10">
		<label>
			<span class="mb-4 block text-lg font-medium">Titel</span>
			<input
				{...form.fields['title'].as('text')}
				value={initialValues?.title}
				placeholder="Vul een titel in..."
				class={[
					'mb-4 block w-full rounded-lg border px-4 py-2.5 text-lg placeholder:text-base placeholder:opacity-80 dark:bg-neutral-800/50',
					(form.fields['title'].issues()?.length ?? 0) > 0 && 'ring-2 ring-pink-500',
				]}
			/>
		</label>
		{#each form.fields['title'].issues() ?? [] as issue}
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
					onclick={() => {
						showName = false
						const field = form.fields['organizerName']
						if (field) field.set('')
					}}
				>
					<Icon icon="tabler--x" class="size-5" />
				</Button>
			</div>
			<input
				id="name"
				{...form.fields['organizerName'].as('text')}
				value={initialValues?.organizerName}
				placeholder="Vul jouw naam in..."
				class={[
					'block w-full rounded-lg border px-4 py-2.5 text-lg placeholder:text-base placeholder:opacity-80 dark:bg-neutral-800/50',
					(form.fields['organizerName'].issues()?.length ?? 0) > 0 && 'ring-2 ring-pink-500',
				]}
			/>
			{#each form.fields['organizerName'].issues() ?? [] as issue}
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
					onclick={() => {
						showDescription = false
						const field = form.fields['description']
						if (field) field.set('')
					}}
				>
					<Icon icon="tabler--x" class="size-5" />
				</Button>
			</div>
			<textarea
				id="description"
				{...form.fields['description'].as('text')}
				value={initialValues?.description}
				rows={4}
				placeholder="Vul een omschrijving in..."
				class={[
					'mb-4 block w-full rounded-lg border px-4 py-2.5 placeholder:opacity-80 dark:bg-neutral-800/50',
					(form.fields['description'].issues()?.length ?? 0) > 0 && 'ring-2 ring-pink-500',
				]}
			></textarea>
			{#each form.fields['description'].issues() ?? [] as issue}
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
			hasIssues={(form.fields['options'].issues()?.length ?? 0) > 0}
		/>

		{#each form.fields['options'].issues() ?? [] as issue}
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
						{...form.fields['hideResponses'].as('checkbox')}
						checked={initialValues?.hideResponses}
						disabled={hideResponsesLocked}
						class="my-0.75 size-4.5 shrink-0 cursor-pointer accent-pink-600 disabled:opacity-50 dark:accent-pink-700"
					/>
					{#if hideResponsesLocked}
						<input type="hidden" name="hideResponses" value="on" />
					{/if}

					<p class="font-medium text-neutral-700 dark:text-neutral-300">
						Toon reacties van deelnemers alleen aan de organisator
					</p>
				</label>

				<label class="flex cursor-pointer items-start gap-3">
					<input
						{...form.fields['allowAnonymous'].as('checkbox')}
						checked={initialValues?.allowAnonymous}
						class="my-0.75 size-4.5 shrink-0 cursor-pointer accent-pink-600 dark:accent-pink-700"
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
		{submitLabel}
	</Button>
</form>

<Dialog bind:open={showConfirmation}>
	<div class="space-y-4">
		<h2 class="text-xl font-medium">Opties verwijderen?</h2>
		<p class="text-neutral-600 dark:text-neutral-400">
			Je hebt een of meerdere datums of tijden verwijderd. De beschikbaarheid van deelnemers voor
			deze opties gaat verloren.
		</p>
		<p class="text-neutral-600 dark:text-neutral-400">
			Weet je zeker dat je deze wijzigingen wilt opslaan?
		</p>
		<div class="flex justify-end gap-3 pt-4">
			<Button variant="secondary" onclick={() => (showConfirmation = false)}>Annuleren</Button>
			<Button variant="primary" onclick={confirmSubmit}>Opslaan</Button>
		</div>
	</div>
</Dialog>
