<script lang="ts">
	import { enhance } from '$app/forms'
	import { SvelteMap } from 'svelte/reactivity'
	import DatePicker from './date-picker.svelte'
	import type { Options } from './types'
	import { PlainDate } from '@/lib/temporal'
	import TimeSlot from './time-slot.svelte'
	import { keys } from '@/lib/utils'
	import { untrack } from 'svelte'

	let { form } = $props()

	let datePickerHeight = $state(328)

	let options = new SvelteMap() satisfies Options

	let nestedOptionsError = $derived.by(() => {
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
			id="title"
			name="title"
			class={[
				'mb-4 block w-full rounded-lg border px-4 py-2.5 text-lg dark:bg-zinc-800/50',
				form?.error.nested?.title ? 'outline outline-pink-600 dark:outline-pink-500' : '',
			]}
		/>
		{#if form?.error.nested?.title}
			<p class="text-pink-600 dark:text-pink-500">{form.error.nested.title}</p>
		{/if}
	</div>

	<div class="mb-8">
		<label for="description" class="mb-4 block font-medium">
			Beschrijving
			<span class="font-normal text-zinc-500 dark:text-zinc-400">(optioneel)</span>
		</label>
		<textarea
			id="description"
			name="description"
			class={[
				'mb-4 block w-full rounded-lg border px-4 py-2.5 dark:bg-zinc-800/50',
				form?.error.nested?.description ? 'outline outline-pink-600 dark:outline-pink-500' : '',
			]}
			rows={3}
		></textarea>
		{#if form?.error.nested?.description}
			<p class="text-pink-600 dark:text-pink-500">{form.error.nested.description}</p>
		{/if}
	</div>

	<div class="mb-6 grid gap-6 sm:grid-cols-2">
		<div>
			<p class="mb-4 block font-medium">Datums</p>
			<div
				class={[
					'mb-4 rounded-lg border p-6',
					form?.error.nested?.options ? 'outline outline-pink-600 dark:outline-pink-500' : '',
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
				<span class="font-normal text-zinc-500 dark:text-zinc-400">(optioneel)</span>
			</p>
			<div
				style="--max-height: {datePickerHeight}px"
				class={[
					'gutter-stable relative mb-4 max-h-90 space-y-3 overflow-y-auto rounded-lg border p-5 sm:h-full sm:max-h-[var(--max-height)]',
					nestedOptionsError?.size > 0 ? 'outline outline-pink-600 dark:outline-pink-500' : '',
				]}
			>
				{#each Array.from(options.keys()).toSorted(PlainDate.compare) as date}
					<TimeSlot {date} {options} />
					{#if nestedOptionsError?.has(date)}
						<p class="text-center text-pink-600 dark:text-pink-500">
							{nestedOptionsError.get(date)}
						</p>
					{/if}
				{:else}
					<p class="text-zinc-500 py-4 text-center text-balance dark:text-zinc-400 font-[350] p-2">
						Selecteer datums om tijden toe te voegen.
					</p>
				{/each}
			</div>
		</div>

		<input type="hidden" name="options" value={JSON.stringify(Array.from(options))} />
	</div>

	<div class="mb-6">
		<p class="mb-4 block font-medium">Instellingen</p>
		<div class="grid gap-4 rounded-lg border p-6">
			<div class="flex items-start gap-3">
				<input
					type="checkbox"
					name="settings.disallowAnonymous"
					id="form-disallowAnonymous"
					class="my-1.5 accent-pink-600 dark:accent-pink-700"
				/>
				<label
					for="form-disallowAnonymous"
					class="grid gap-1 font-[350] text-zinc-700 dark:text-zinc-300"
				>
					<p class="text-balance">Maak het verplicht voor deelnemers om hun naam in te vullen</p>
				</label>
			</div>
			<div class="flex items-start gap-3">
				<input
					type="checkbox"
					name="settings.hideParticipants"
					id="form-hideParticipants"
					class="my-1.5 accent-pink-600 dark:accent-pink-700"
				/>
				<label
					for="form-hideParticipants"
					class="grid gap-1 font-[350] text-zinc-700 dark:text-zinc-300"
				>
					<p class="text-balance">Verberg deelnemers voor elkaar</p>
				</label>
			</div>
		</div>
	</div>

	<button
		type="submit"
		class="ml-auto block w-fit rounded-lg bg-pink-700 px-4 py-2 font-semibold text-white shadow transition hover:bg-pink-800 dark:bg-pink-800 dark:text-zinc-100 dark:hover:bg-pink-900"
	>
		Afspraak aanmaken
	</button>
</form>
