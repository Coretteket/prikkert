<script lang="ts">
	import { enhance } from '$app/forms'
	import { SvelteSet } from 'svelte/reactivity'
	import DatePicker from './date-picker.svelte'
	import { keys } from '@/lib/utils'
	import { PlainDate } from '@/lib/temporal'
	import TimeInput from './time-input.svelte'
	import TimeRangeInput from './time-range-input.svelte'

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

	let selectedDates: Array<PlainDate> = $state([])
</script>

<form method="POST" use:enhance class="grid gap-4 border p-4">
	{#if form?.formErrors && form.formErrors.length > 0}
		<p class="text-red-500">{form.formErrors}</p>
	{/if}

	<label for="form-name" class="font-bold">Titel</label>
	<input id="form-name" type="text" name="title" class="border px-2 py-1" />
	{#if form?.fieldErrors?.title}
		<p class="text-red-500">{form.fieldErrors.title}</p>
	{/if}

	{#each selectedMetaFields as fieldId}
		{@const field = metaFields[fieldId]}

		<div class="flex items-center justify-between">
			<label for="form-{fieldId}" class="font-bold">{field.label}</label>
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
					class="border px-2 py-1 text-sm"
					onclick={() => selectedMetaFields.add(fieldId)}
				>
					+ {metaFields[fieldId].label}
				</button>
			{/each}
		</div>
	{/if}

	<label for="form-dates" class="font-bold">Datums</label>
	<div id="form-dates" class="max-w-80 border p-4">
		<DatePicker bind:selected={selectedDates} />
	</div>
	{#if form?.fieldErrors?.options}
		<p class="text-red-500">{form.fieldErrors.options}</p>
	{/if}

	{#each selectedOptionFields as fieldId}
		{@const field = optionFields[fieldId]}

		<div class="flex items-center justify-between">
			<label for="form-{fieldId}" class="font-bold">{field.label}</label>
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
					class="border px-2 py-1 text-sm"
					onclick={() => selectedOptionFields.add(fieldId)}
				>
					+ {optionFields[fieldId].label}
				</button>
			{/each}
		</div>
	{/if}

	<button type="submit" class="border px-2 py-1">Afspraak maken</button>
</form>

{#snippet location(fieldId: string)}
	<input name={fieldId} id="form-{fieldId}" type="text" class="border px-2 py-1" />
{/snippet}

{#snippet description(fieldId: string)}
	<textarea name={fieldId} id="form-{fieldId}" class="h-24 border px-2 py-1"></textarea>
{/snippet}

{#snippet times(fieldId: string)}
	<div class="grid gap-4">
		{#each selectedDates.toSorted(PlainDate.compare) as date}
			<div class="grid gap-2">
				<div>
					{date.toLocaleString('nl', {
						weekday: 'long',
						day: 'numeric',
						month: 'long',
						year: 'numeric',
					})}
				</div>
				<TimeRangeInput />
			</div>
		{:else}
			<p>Selecteer datums om tijdsloten toe te voegen.</p>
		{/each}
	</div>
{/snippet}
