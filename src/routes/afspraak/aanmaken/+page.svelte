<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity'
	import DatePicker from './date-picker.svelte'
	import type { Options } from './types'
	import { PlainDate } from '@/lib/temporal'
	import TimeSlot from './time-slot.svelte'

	let options = new SvelteMap() satisfies Options

	let datePickerHeight = $state(328)
</script>

<h1 class="font-display mb-8 text-xl font-[550]">Afspraak aanmaken</h1>

<form>
	<div class="mb-8">
		<label for="title" class="mb-4 block font-medium">Titel</label>
		<input
			type="text"
			id="title"
			class="block w-full rounded-lg border px-4 py-2.5 text-lg dark:bg-zinc-800/50"
		/>
	</div>

	<div class="mb-8">
		<label for="description" class="mb-4 block font-medium">
			Beschrijving
			<span class="font-normal text-zinc-500 dark:text-zinc-400">(optioneel)</span>
		</label>
		<textarea
			id="description"
			class="block w-full rounded-lg border px-4 py-2.5 dark:bg-zinc-800/50"
			rows={3}
		></textarea>
	</div>

	<div class="mb-6 grid gap-6 sm:grid-cols-2">
		<div>
			<p class="mb-4 block font-medium">Datums</p>
			<div class="rounded-lg border p-6" bind:clientHeight={datePickerHeight}>
				<DatePicker {options} />
			</div>
		</div>
		<div>
			<p class="mb-4 block font-medium">
				Tijden
				<span class="font-normal text-zinc-500 dark:text-zinc-400">(optioneel)</span>
			</p>
			<div
				style="--max-height: {datePickerHeight}px"
				class="gutter-stable relative max-h-90 space-y-3 overflow-y-auto rounded-lg border p-5 sm:h-full sm:max-h-[var(--max-height)]"
			>
				{#each Array.from(options.keys()).toSorted(PlainDate.compare) as date}
					<TimeSlot {date} {options} />
				{:else}
					<p class="text-zinc-500 py-4 text-center text-balance dark:text-zinc-400 font-[350] p-2">
						Selecteer datums om tijden toe te voegen.
					</p>
				{/each}
			</div>
		</div>
	</div>

	<div class="mb-6">
		<p class="mb-4 block font-medium">Instellingen</p>
		<div class="grid gap-4 rounded-lg border p-6">
			<div class="flex items-start gap-3">
				<input
					type="checkbox"
					name="force-name"
					id="form-force-name"
					class="my-1.5 accent-pink-600 dark:accent-pink-700"
				/>
				<label for="form-force-name" class="grid gap-1 font-[350] text-zinc-700 dark:text-zinc-300">
					<p class="text-balance">Maak het verplicht voor deelnemers om hun naam in te vullen</p>
				</label>
			</div>
			<div class="flex items-start gap-3">
				<input
					type="checkbox"
					name="private"
					id="form-private"
					class="my-1.5 accent-pink-600 dark:accent-pink-700"
				/>
				<label for="form-private" class="grid gap-1 font-[350] text-zinc-700 dark:text-zinc-300">
					<p class="text-balance">Verberg deelnemers voor elkaar</p>
				</label>
			</div>
		</div>
	</div>

	<a
		href="/afspraak/aanmaken"
		class="ml-auto block w-fit rounded-lg bg-pink-700 px-4 py-2 font-semibold text-white shadow transition hover:bg-pink-800 dark:bg-pink-800 dark:text-zinc-100 dark:hover:bg-pink-900"
	>
		Afspraak aanmaken
	</a>
</form>
