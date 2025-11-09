<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity'
	import DatePicker from './date-picker.svelte'
	import type { Options } from './types'
	import { PlainDate } from '@/lib/temporal'
	import TimeSlot from './time-slot.svelte'
	import { untrack } from 'svelte'
	import Button from '@/lib/components/button.svelte'
	import { enhance } from '$app/forms'
	import { keys } from '@/lib/utils'

	let { form } = $props()

	let datePickerHeight = $state(338)

	let options = new SvelteMap() satisfies Options

	let nestedOptionsIssues = $derived.by(() => {
		if (!form?.error?.nested) return new Map()
		const nestedKeys = keys(form?.error.nested ?? {})
		return new Map(
			untrack(() => options.keys()).flatMap((date, i) => {
				const issues = nestedKeys.flatMap((k) =>
					k.startsWith('options.' + i) ? form?.error.nested?.[k] : [],
				)
				return issues.length > 0 ? [[date, issues] as const] : []
			}),
		)
	})
</script>

<h1 class="font-display mb-8 text-2xl font-[550]">Afspraak aanmaken</h1>

<form method="POST" use:enhance>
	<div class="mb-8">
		<label for="title" class="mb-4 block font-medium">Titel</label>
		<input
			type="text"
			name="title"
			id="title"
			class={[
				'mb-4 block w-full rounded-lg border px-4 py-2.5 text-lg dark:bg-neutral-800/50',
				form?.error?.nested?.title && 'outline outline-pink-600 dark:outline-pink-500',
			]}
		/>
		{#if form?.error?.nested?.title}
			{#each Array.isArray(form.error.nested.title) ? form.error.nested.title : [form.error.nested.title] as issue}
				<p class="text-pink-600 dark:text-pink-500">{issue}</p>
			{/each}
		{/if}
	</div>

	<div class="mb-8">
		<label for="description" class="mb-4 block font-medium">
			Beschrijving
			<span class="font-normal text-neutral-500 dark:text-neutral-400">(optioneel)</span>
		</label>
		<textarea
			name="description"
			id="description"
			class={[
				'mb-4 block w-full rounded-lg border px-4 py-2.5 dark:bg-neutral-800/50',
				form?.error?.nested?.description && 'outline outline-pink-600 dark:outline-pink-500',
			]}
			rows={3}
		></textarea>
		{#if form?.error?.nested?.description}
			{#each Array.isArray(form.error.nested.description) ? form.error.nested.description : [form.error.nested.description] as issue}
				<p class="text-pink-600 dark:text-pink-500">{issue}</p>
			{/each}
		{/if}
	</div>

	<div class="mb-6 grid gap-6 sm:grid-cols-2">
		<div>
			<p class="mb-4 block font-medium">
				Datums
				{#if options.size > 0}
					<span class="font-normal text-neutral-500 dark:text-neutral-400">
						({options.size} geselecteerd)
					</span>
				{/if}
			</p>
			<div
				class={[
					'mb-4 rounded-lg border p-6',
					form?.error?.nested?.options && 'outline outline-pink-600 dark:outline-pink-500',
				]}
				bind:clientHeight={datePickerHeight}
			>
				<DatePicker {options} />
			</div>

			{#if form?.error.nested?.options}
				<p class="text-pink-600 dark:text-pink-500">{form?.error.nested?.options}</p>
			{/if}
		</div>
		<div>
			<p class="mb-4 block font-medium">
				Tijden
				<span class="font-normal text-neutral-500 dark:text-neutral-400">(optioneel)</span>
			</p>
			<div
				style="--max-height: {datePickerHeight}px"
				class={[
					'gutter-stable relative mb-4 max-h-90 space-y-3 overflow-y-auto rounded-lg border p-5 sm:h-full sm:max-h-(--max-height)',
					nestedOptionsIssues.size > 0 && 'outline outline-pink-600 dark:outline-pink-500',
				]}
			>
				{#each Array.from(options.keys()).toSorted(PlainDate.compare) as date}
					<TimeSlot {date} {options} />
					{#if nestedOptionsIssues.has(date)}
						<p class="text-center text-pink-600 dark:text-pink-500">
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
		</div>

		<input type="hidden" name="options" value={JSON.stringify(Array.from(options))} />
	</div>

	<div class="mb-6">
		<p class="mb-4 block font-medium">
			Instellingen
			<span class="font-normal text-neutral-500 dark:text-neutral-400">(optioneel)</span>
		</p>
		<div class="grid gap-4 rounded-lg border p-6">
			<div class="flex items-start gap-3">
				<input
					type="checkbox"
					name="settings.disallowAnonymous"
					id="form-disallowAnonymous"
					class="my-1.5 size-4 accent-pink-600 dark:accent-pink-700"
				/>
				<label
					for="form-disallowAnonymous"
					class="grid gap-1 font-[350] text-neutral-700 dark:text-neutral-300"
				>
					<p class="text-balance">Maak het verplicht voor deelnemers om hun naam in te vullen</p>
				</label>
			</div>
			<div class="flex items-start gap-3">
				<input
					type="checkbox"
					name="settings.hideParticipants"
					id="form-hideParticipants"
					class="my-1.5 size-4 accent-pink-600 dark:accent-pink-700"
				/>
				<label
					for="form-hideParticipants"
					class="grid gap-1 font-[350] text-neutral-700 dark:text-neutral-300"
				>
					<p class="text-balance">Verberg deelnemers voor elkaar</p>
				</label>
			</div>
		</div>
	</div>

	<Button type="submit" variant="primary" class="ml-auto">Afspraak aanmaken</Button>
</form>
