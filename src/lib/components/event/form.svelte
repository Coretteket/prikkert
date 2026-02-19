<script lang="ts">
	import type { RemoteForm } from '@sveltejs/kit'

	import { SvelteMap } from 'svelte/reactivity'

	import { emptyEntry, type OptionEntry, type Options, type Slot } from '@/shared/event/types'
	import EventEditDialog from '@/components/event/confirm-dialog.svelte'
	import DatePicker from '@/components/event/date-picker.svelte'
	import TimeSlot from '@/components/event/time-slot.svelte'
	import Button from '@/components/button.svelte'
	import { Temporal } from '@/shared/temporal'
	import Icon from '@/components/icon.svelte'

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
		options,
		initialValues,
		isEditMode = false,
		hasResponses = false,
		submitLabel = 'Afspraak aanmaken',
	}: {
		form: Omit<RemoteForm<FormFieldInput, unknown>, 'for'>
		options: Options
		initialValues?: Omit<FormFieldInput, 'options'> & { options: Map<string, OptionEntry> }
		isEditMode?: boolean
		hasResponses?: boolean
		submitLabel?: string
	} = $props()

	let showName = $derived(Boolean(initialValues?.organizerName))
	let showDescription = $derived(Boolean(initialValues?.description))
	let showOptions = $derived(
		Array.from(initialValues?.options.values() ?? []).some(
			(entry) => entry.hasTime || entry.slots.some((slot) => slot.note),
		) ?? false,
	)
	let showSettings = $derived(
		Boolean(initialValues?.hideResponses) || Boolean(initialValues?.allowAnonymous),
	)
	const hideResponsesLocked = $derived(hasResponses && Boolean(initialValues?.hideResponses))

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

	function compareSlots(a: Slot, b: Slot) {
		const aStart = a.startsAt?.toString()
		const bStart = b.startsAt?.toString()
		const aEnd = a.endsAt?.toString()
		const bEnd = b.endsAt?.toString()
		return aStart === bStart && aEnd === bEnd
	}

	function hasRemovedOptions() {
		if (!initialValues?.options) return false

		for (const [date, entry] of initialValues.options) {
			if (!options.has(date)) return true
			const currentSlots = options.get(date)!.slots

			for (const slot of entry.slots) {
				const found = currentSlots.some((s) => compareSlots(s, slot))
				if (!found) return true
			}
		}

		return false
	}

	let showConfirmation = $state(false)
	let onConfirm: ((value: boolean) => void) | undefined = $state()

	function untilConfirmed() {
		const hasRemoved = hasRemovedOptions()
		if (!hasRemoved || !hasResponses) return Promise.resolve(true)
		return new Promise<boolean>((resolve) => {
			onConfirm = resolve
			showConfirmation = true
		})
	}
</script>

<form
	{...form.enhance(async (form) => {
		if (isEditMode === false) form.submit()
		else {
			const confirmed = await untilConfirmed()
			if (!confirmed) return
			form.submit()
		}
	})}
>
	<input
		type="hidden"
		name="options"
		value={JSON.stringify(
			Array.from(options).toSorted(([a], [b]) => Temporal.PlainDate.compare(a, b)),
		)}
	/>

	<div class="mb-10">
		<label>
			<span class="mb-4 block text-lg font-medium">Titel</span>
			<input
				{...form.fields.title.as('text')}
				value={initialValues?.title}
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
					onclick={() => {
						showName = false
						const field = form.fields.organizerName
						if (field) field.set('')
					}}
				>
					<Icon icon="tabler--x" class="size-5" />
				</Button>
			</div>
			<input
				id="name"
				{...form.fields.organizerName.as('text')}
				value={initialValues?.organizerName}
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
		<div class="-mt-6 flex flex-wrap gap-3">
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
						const field = form.fields.description
						if (field) field.set('')
					}}
				>
					<Icon icon="tabler--x" class="size-5" />
				</Button>
			</div>
			<textarea
				id="description"
				{...form.fields.description.as('text')}
				value={initialValues?.description}
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
			initialOptions={initialValues?.options}
			maxViewMonths={2}
			hasIssues={(form.fields.options.issues()?.length ?? 0) > 0}
		/>

		{#each form.fields.options.issues() ?? [] as issue}
			<p class="font-medium text-pink-600 dark:text-pink-500" data-issue>{issue.message}</p>
		{/each}
	</div>

	<div class="mb-10">
		{#if showOptions}
			<div class="mb-4 flex items-center justify-between">
				<span class="text-lg font-medium">
					Opties
					<span class="text-base font-normal text-neutral-500 dark:text-neutral-400">
						(optioneel)
					</span>
				</span>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					label="Tijden verbergen"
					onclick={() => {
						showOptions = false
						for (const date of options.keys()) options.set(date, emptyEntry)
					}}
				>
					<Icon icon="tabler--x" class="size-5" />
				</Button>
			</div>
			<div
				class={[
					'relative mb-4 max-h-100 min-h-48 divide-y overflow-y-auto rounded-lg border [scrollbar-gutter:stable]',
					nestedOptionsIssues.size > 0 && 'ring-2 ring-pink-500',
				]}
			>
				{#each Array.from(options.keys()).toSorted(Temporal.PlainDate.compare) as date, i}
					<div class="px-6 pt-4.5 pb-5.5">
						<TimeSlot {date} {options} isFirst={i === 0} />
						{#if nestedOptionsIssues.has(date)}
							<p class="mt-4 text-center font-medium text-pink-600 dark:text-pink-500" data-issue>
								{nestedOptionsIssues.get(date)}
							</p>
						{/if}
					</div>
				{:else}
					<p
						class="text-neutral-500 py-4 absolute left-1/2 top-1/2 -translate-1/2 text-center text-balance dark:text-neutral-400"
					>
						Selecteer datums om opmerkingen en tijden toe te voegen.
					</p>
				{/each}
			</div>
		{/if}
	</div>

	{#if !showOptions || !showSettings}
		<div class="-mt-6 mb-8 flex flex-wrap gap-3">
			{#if !showOptions}
				<Button type="button" variant="secondary" size="sm" onclick={() => (showOptions = true)}>
					Opmerkingen en tijden toevoegen
				</Button>
			{/if}
			{#if !showSettings}
				<Button type="button" variant="secondary" size="sm" onclick={() => (showSettings = true)}>
					Privacy instellen
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
						checked={initialValues?.hideResponses}
						disabled={hideResponsesLocked}
						class="my-0.75 size-4.5 shrink-0 cursor-pointer accent-pink-600 disabled:opacity-50 dark:accent-pink-700"
					/>

					<!-- disabled input is not submitted, so we need a hidden input -->
					{#if hideResponsesLocked}
						<input
							{...form.fields.hideResponses.as('checkbox')}
							checked={initialValues?.hideResponses}
							type="hidden"
						/>
					{/if}

					<p class="text-neutral-700 dark:text-neutral-300">
						Toon reacties van deelnemers alleen aan de organisator
					</p>
				</label>

				<label class="flex cursor-pointer items-start gap-3">
					<input
						{...form.fields.allowAnonymous.as('checkbox')}
						checked={initialValues?.allowAnonymous}
						class="my-0.75 size-4.5 shrink-0 cursor-pointer accent-pink-600 dark:accent-pink-700"
					/>

					<p class="text-neutral-700 dark:text-neutral-300">
						Sta deelnemers toe om anoniem te reageren
					</p>
				</label>

				<p class="text-[15px] text-neutral-500 dark:text-neutral-400">
					Lees meer over deze instellingen in de
					<a href="/privacy" target="_blank" class="underline"> privacyverklaring </a>.
				</p>
			</div>
		</div>
	{/if}

	<Button type="submit" variant="primary" class="ml-auto" disabled={form.pending > 0}>
		{submitLabel}
	</Button>
</form>

<EventEditDialog bind:open={showConfirmation} {onConfirm} />
