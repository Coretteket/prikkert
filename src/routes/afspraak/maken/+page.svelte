<script lang="ts">
	import { enhance } from '$app/forms'
	import { SvelteSet } from 'svelte/reactivity'
	import DatePicker from './date-picker.svelte'
	import { keys } from '@/lib/utils'
	import { Now, PlainDate } from '@/lib/temporal'
	import TimeSlot from './time-slot.svelte'

	let { form } = $props()

	const metaFields = {
		description: { label: 'Beschrijving', snippet: description },
		location: { label: 'Locatie', snippet: location },
	}

	const optionFields = {
		times: { label: 'Tijdsloten', snippet: times },
	}

	const metaFieldsKeys = new Set(keys(metaFields))
	const optionFieldsKeys = new Set(keys(optionFields))

	let selectedMetaFields: Set<keyof typeof metaFields> = new SvelteSet([])
	let selectedOptionFields: Set<keyof typeof optionFields> = new SvelteSet([])

	let selectedDates: Array<PlainDate> = $state(
		Array.from({ length: 14 }).map((_, i) => Now.plainDateISO().add({ days: i })),
	)
</script>

<form method="POST" use:enhance class="grid gap-5">
	{#if form?.formErrors && form.formErrors.length > 0}
		<p class="text-red-500">{form.formErrors}</p>
	{/if}

	<label for="form-name" class="text-lg font-bold">Titel</label>
	<input id="form-name" type="text" name="title" class="rounded border px-3 py-2 text-lg" />
	{#if form?.fieldErrors?.title}
		<p class="text-red-500">{form.fieldErrors.title}</p>
	{/if}

	{#each selectedMetaFields as fieldId}
		{@const field = metaFields[fieldId]}

		<div class="flex items-center justify-between">
			<label for="form-{fieldId}" class="text-lg font-bold">{field.label}</label>
			<button onclick={() => selectedMetaFields.delete(fieldId)}>X</button>
		</div>

		{@render field.snippet(fieldId)}

		{#if form?.fieldErrors?.[fieldId]}
			<p class="text-red-500">{form.fieldErrors[fieldId]}</p>
		{/if}
	{/each}

	{#if metaFieldsKeys.difference(selectedMetaFields).size > 0}
		<div class="flex gap-2">
			{#each metaFieldsKeys.difference(selectedMetaFields) as fieldId}
				<button
					type="button"
					class="rounded border px-2 py-1 text-sm"
					onclick={() => selectedMetaFields.add(fieldId)}
				>
					+ {metaFields[fieldId].label}
				</button>
			{/each}
		</div>
	{/if}

	<label for="form-dates" class="text-lg font-bold">Datums</label>
	<div id="form-dates">
		<DatePicker bind:selected={selectedDates} />
	</div>

	{#if form?.fieldErrors?.options}
		<p class="text-red-500">{form.fieldErrors.options}</p>
	{/if}

	{#each selectedOptionFields as fieldId}
		{@const field = optionFields[fieldId]}

		<div class="flex items-center justify-between">
			<label for="form-{fieldId}" class="text-lg font-bold">{field.label}</label>
			<button onclick={() => selectedOptionFields.delete(fieldId)}>X</button>
		</div>

		{@render field.snippet(fieldId)}

		{#if form?.fieldErrors?.[fieldId]}
			<p class="text-red-500">{form.fieldErrors[fieldId]}</p>
		{/if}
	{/each}

	{#if optionFieldsKeys.difference(selectedOptionFields).size > 0}
		<div class="flex gap-2">
			{#each optionFieldsKeys.difference(selectedOptionFields) as fieldId}
				<button
					type="button"
					class="rounded border px-2 py-1 text-sm"
					onclick={() => selectedOptionFields.add(fieldId)}
				>
					+ {optionFields[fieldId].label}
				</button>
			{/each}
		</div>
	{/if}

	<button type="submit" class="rounded border px-2 py-2">Afspraak maken</button>
</form>

{#snippet location(fieldId: string)}
	<input name={fieldId} id="form-{fieldId}" type="text" class="rounded border px-2 py-2" />
{/snippet}

{#snippet description(fieldId: string)}
	<textarea name={fieldId} id="form-{fieldId}" class="rounded border px-2 py-2"></textarea>
{/snippet}

{#snippet times(fieldId: string)}
	<div id="times" class="relative grid max-h-100 sm:max-h-80 gap-3 overflow-y-scroll rounded border p-5">
		{#each selectedDates.toSorted(PlainDate.compare) as date (date)}
			<TimeSlot
				removeDate={() => (selectedDates = selectedDates.filter((d) => !d.equals(date)))}
				{date}
			/>
		{:else}
			<p>Selecteer datums om tijdsloten toe te voegen.</p>
		{/each}
	</div>
{/snippet}
