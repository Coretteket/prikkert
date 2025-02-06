<script lang="ts">
	import { enhance } from '$app/forms'
	import { SvelteMap, SvelteSet } from 'svelte/reactivity'
	import DatePicker from './date-picker.svelte'
	import { keys } from '@/lib/utils'
	import { PlainDate } from '@/lib/temporal'
	import TimeSlot from './time-slot.svelte'
	import Button from '@/lib/components/button.svelte'
	import { IconPlus } from '@tabler/icons-svelte'
	import type { Slot } from './types'

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

	let options = new SvelteMap<PlainDate, Array<Slot>>()
</script>

<form method="POST" use:enhance class="grid gap-5">
	{#if form?.formErrors && form.formErrors.length > 0}
		<p class="text-red-500">{form.formErrors}</p>
	{/if}

	<label for="form-name" class="font-display font-medium text-gray-800">Titel</label>
	<input
		id="form-name"
		type="text"
		name="title"
		class="rounded border border-gray-300 px-3 py-2 text-lg"
	/>
	{#if form?.fieldErrors?.title}
		<p class="text-red-500">{form.fieldErrors.title}</p>
	{/if}

	{#each selectedMetaFields as fieldId}
		{@const field = metaFields[fieldId]}

		<div class="flex items-center justify-between">
			<label for="form-{fieldId}" class="font-display font-medium text-gray-800">
				{field.label}
			</label>
			<button
				type="button"
				onclick={() => selectedMetaFields.delete(fieldId)}
				class="cursor-pointer"
			>
				X
			</button>
		</div>

		{@render field.snippet(fieldId)}

		{#if form?.fieldErrors?.[fieldId]}
			<p class="text-red-500">{form.fieldErrors[fieldId]}</p>
		{/if}
	{/each}

	{#if metaFieldsKeys.difference(selectedMetaFields).size > 0}
		<div class="mb-4 flex gap-2">
			{#each metaFieldsKeys.difference(selectedMetaFields) as fieldId}
				<Button as="button" type="button" onclick={() => selectedMetaFields.add(fieldId)}>
					<IconPlus class="size-3" />
					{metaFields[fieldId].label}
				</Button>
			{/each}
		</div>
	{/if}

	<label for="form-dates" class="font-display font-medium text-gray-800">Datums</label>
	<div id="form-dates">
		<DatePicker {options} />
	</div>

	{#if form?.fieldErrors?.options}
		<p class="text-red-500">{form.fieldErrors.options}</p>
	{/if}

	{#each selectedOptionFields as fieldId}
		{@const field = optionFields[fieldId]}

		<div class="flex items-center justify-between">
			<label for="form-{fieldId}" class="font-display font-medium text-gray-800">
				{field.label}
			</label>
			<button
				type="button"
				onclick={() => selectedOptionFields.delete(fieldId)}
				class="cursor-pointer"
			>
				X
			</button>
		</div>

		{@render field.snippet(fieldId)}

		{#if form?.fieldErrors?.[fieldId]}
			<p class="text-red-500">{form.fieldErrors[fieldId]}</p>
		{/if}
	{/each}

	{#if optionFieldsKeys.difference(selectedOptionFields).size > 0}
		<div class="mb-4 flex gap-2">
			{#each optionFieldsKeys.difference(selectedOptionFields) as fieldId}
				<Button as="button" type="button" onclick={() => selectedOptionFields.add(fieldId)}>
					<IconPlus class="size-3" />
					{optionFields[fieldId].label}
				</Button>
			{/each}
		</div>
	{/if}

	<Button as="button" color="primary" type="submit" class="mt-4 ml-auto" size="lg">
		Afspraak maken
	</Button>
</form>

{#snippet location(fieldId: string)}
	<input
		name={fieldId}
		id="form-{fieldId}"
		type="text"
		class="rounded border border-gray-300 px-2 py-2"
	/>
{/snippet}

{#snippet description(fieldId: string)}
	<textarea
		name={fieldId}
		id="form-{fieldId}"
		class="rounded border border-gray-300 px-2 py-2"
	></textarea>
{/snippet}

{#snippet times(fieldId: string)}
	<div class="relative grid max-h-80 gap-3 overflow-y-scroll rounded border border-gray-300 p-5">
		{#each Array.from(options.keys()).toSorted(PlainDate.compare) as date}
			<TimeSlot {date} {options} />
		{:else}
			<p>Selecteer datums om tijdsloten toe te voegen.</p>
		{/each}
	</div>
{/snippet}
