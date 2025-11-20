<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity'

	import { createEvent } from '@/remote/create-event.remote'
	import Button from '@/components/button.svelte'
	import { PlainDate } from '@/temporal'

	import type { Options } from './types'

	import DatePicker from './date-picker.svelte'
	import TimeSlot from './time-slot.svelte'

	let datePickerHeight = $state(338)

	let options = new SvelteMap() satisfies Options

	const nestedOptionsIssues = $derived.by(() => {
		const allIssues = createEvent.fields.allIssues() ?? []
		const optionsIssues = new SvelteMap<string, string>()

		for (const issue of allIssues) {
			if (issue.path?.[0] === 'options' && typeof issue.path[1] === 'number') {
				const dateIndex = issue.path[1]
				const dates = Array.from(options.keys()).toSorted(PlainDate.compare)
				if (dates[dateIndex]) {
					optionsIssues.set(dates[dateIndex], issue.message)
				}
			}
		}

		return optionsIssues
	})
</script>

<h1 class="font-display mb-8 text-2xl font-[550]">Afspraak aanmaken</h1>

<form {...createEvent}>
	<div class="mb-8">
		<label>
			<span class="mb-4 block font-medium">Titel</span>
			<input
				{...createEvent.fields.title.as('text')}
				placeholder="Vul een titel in..."
				class={[
					'mb-4 block w-full rounded-lg border px-4 py-2.5 text-lg dark:bg-neutral-800/50 placeholder:text-base placeholder:opacity-80',
					(createEvent.fields.title.issues()?.length ?? 0) > 0 && 'ring ring-pink-500',
				]}
			/>
		</label>
		{#each createEvent.fields.title.issues() ?? [] as issue}
			<p class="my-2 font-medium text-pink-600 dark:text-pink-500">{issue.message}</p>
		{/each}
	</div>

	<div class="mb-8">
		<label>
			<div class="mb-4">
				<span class="font-medium">Omschrijving</span>
				<span class="font-normal text-neutral-500 dark:text-neutral-400">(optioneel)</span>
			</div>
			<textarea
				id="description"
				{...createEvent.fields.description.as('text')}
				rows={2}
				placeholder="Vul een omschrijving in..."
				class={[
					'mb-4 block w-full rounded-lg border px-4 py-2.5 dark:bg-neutral-800/50 placeholder:opacity-80',
					(createEvent.fields.description.issues()?.length ?? 0) > 0 && 'ring ring-pink-500',
				]}
			></textarea>
		</label>

		{#each createEvent.fields.description.issues() ?? [] as issue}
			<p class="font-medium text-pink-600 dark:text-pink-500">{issue.message}</p>
		{/each}
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
					(createEvent.fields.options.issues()?.length ?? 0) > 0 && 'ring ring-pink-500',
				]}
				bind:clientHeight={datePickerHeight}
			>
				<DatePicker {options} />
			</div>

			{#each createEvent.fields.options.issues() ?? [] as issue}
				<p class="font-medium text-pink-600 dark:text-pink-500">{issue.message}</p>
			{/each}
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
					nestedOptionsIssues.size > 0 && 'ring ring-pink-500',
				]}
			>
				{#each Array.from(options.keys()).toSorted(PlainDate.compare) as date}
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
		</div>

		<input type="hidden" name="options" value={JSON.stringify(Array.from(options))} />
	</div>

	<div class="mb-6">
		<p class="mb-4 block font-medium">
			Instellingen
			<span class="font-normal text-neutral-500 dark:text-neutral-400">(optioneel)</span>
		</p>
		<div class="grid gap-4 rounded-lg border p-6">
			<label
				class="flex cursor-pointer items-start gap-3 font-[350] text-neutral-700 dark:text-neutral-300"
			>
				<input
					{...createEvent.fields.settings.allowAnonymous.as('checkbox')}
					class="my-[3px] size-4.5 cursor-pointer accent-pink-600 dark:accent-pink-700"
				/>

				<p class="text-balance">Sta deelnemers toe om anoniem te reageren</p>
			</label>
			<label
				class="flex cursor-pointer items-start gap-3 font-[350] text-neutral-700 dark:text-neutral-300"
			>
				<input
					{...createEvent.fields.settings.hideParticipants.as('checkbox')}
					class="my-[3px] size-4.5 cursor-pointer accent-pink-600 dark:accent-pink-700"
				/>

				<p class="text-balance">Toon reacties alleen aan de organisator</p>
			</label>
		</div>
	</div>

	<Button type="submit" variant="primary" class="ml-auto" disabled={createEvent.pending > 0}>
		Afspraak aanmaken
	</Button>
</form>
