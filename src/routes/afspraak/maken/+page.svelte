<script lang="ts">
	import { enhance } from '$app/forms'
	import { SvelteMap, SvelteSet } from 'svelte/reactivity'
	import DatePicker from './date-picker.svelte'
	import { keys } from '@/lib/utils'
	import { PlainDate } from '@/lib/temporal'
	import TimeSlot from './time-slot.svelte'
	import Button from '@/lib/components/button.svelte'
	import { IconPlus } from '@tabler/icons-svelte'
	import type { Options } from './types'

	let { form } = $props()

	const metaFields = {
		organizer: { label: 'Jouw naam', snippet: organizer },
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

	let options = new SvelteMap() satisfies Options
</script>

<h1 class="font-display mb-6 text-xl font-medium">Afspraak maken</h1>

<form method="POST" use:enhance class="grid gap-5">
	{#if form?.error.root && form.error.root.length > 0}
		<p class="text-red-500">{form.error.root}</p>
	{/if}

	<label for="form-title" class="text-gray-800">Titel</label>
	<input
		name="title"
		id="form-title"
		type="text"
		class="rounded-md border border-gray-300 px-3 py-2 placeholder:text-base placeholder:text-gray-400"
		placeholder="Hoe heet deze afspraak?"
	/>

	{#if form?.error.nested?.title}
		<p class="text-red-500">{form.error.nested.title}</p>
	{/if}

	{#each selectedMetaFields as fieldId}
		{@const field = metaFields[fieldId]}

		<div class="flex items-center justify-between">
			<label for="form-{fieldId}" class="text-gray-800">
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

		{#if form?.error.nested?.[fieldId]}
			<p class="text-red-500">{form.error.nested[fieldId]}</p>
		{/if}
	{/each}

	{#if metaFieldsKeys.difference(selectedMetaFields).size > 0}
		<div class="mb-4 flex gap-2">
			{#each metaFieldsKeys.difference(selectedMetaFields) as fieldId}
				<button
					type="button"
					onclick={() => selectedMetaFields.add(fieldId)}
					class="flex cursor-pointer items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-50"
				>
					<IconPlus class="size-3" />
					{metaFields[fieldId].label}
				</button>
			{/each}
		</div>
	{/if}

	<label for="form-dates" class="text-gray-800">Datums</label>
	<div id="form-dates">
		<DatePicker {options} />
		<input type="hidden" name="options" value={JSON.stringify(Array.from(options.entries()))} />
	</div>

	{#if form?.error.nested?.options}
		<p class="text-red-500">{form.error.nested.options}</p>
	{/if}

	{#each selectedOptionFields as fieldId}
		{@const field = optionFields[fieldId]}

		<div class="flex items-center justify-between">
			<label for="form-{fieldId}" class="text-gray-800">
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

		<!-- {#if form?.fieldErrors?.[fieldId]}
			<p class="text-red-500">{form.fieldErrors[fieldId]}</p>
		{/if} -->
	{/each}

	{#if optionFieldsKeys.difference(selectedOptionFields).size > 0}
		<div class="mb-4 flex gap-2">
			{#each optionFieldsKeys.difference(selectedOptionFields) as fieldId}
				<button
					type="button"
					onclick={() => selectedOptionFields.add(fieldId)}
					class="flex cursor-pointer items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-50"
				>
					<IconPlus class="size-3" />
					{optionFields[fieldId].label}
				</button>
			{/each}
		</div>
	{/if}

	<Button as="button" color="primary" type="submit" class="mt-4 ml-auto">Afspraak maken</Button>
</form>

{#snippet organizer(fieldId: string)}
	<input
		name={fieldId}
		id="form-{fieldId}"
		type="text"
		class="rounded border border-gray-300 px-3 py-2 placeholder:text-base placeholder:text-gray-400"
		placeholder="Wie organiseert deze afspraak?"
	/>
{/snippet}

{#snippet location(fieldId: string)}
	<input
		name={fieldId}
		id="form-{fieldId}"
		type="text"
		class="rounded border border-gray-300 px-3 py-2 placeholder:text-base placeholder:text-gray-400"
		placeholder="Waar is deze afspraak?"
	/>
{/snippet}

{#snippet description(fieldId: string)}
	<textarea
		name={fieldId}
		id="form-{fieldId}"
		class="rounded border border-gray-300 px-3 py-2 placeholder:text-base placeholder:text-gray-400"
		placeholder="Geef een beschrijving van deze afspraak..."
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
