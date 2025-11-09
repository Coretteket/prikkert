<script lang="ts">
	import { formatDateTimeRange } from '@/lib/time-format'
	import type { Snippet } from 'svelte'
	import type { InferSelectModel } from 'drizzle-orm'
	import type { schema } from '@/lib/server/db'
	import Icon from '@/lib/components/icon.svelte'

	type Props = {
		option: Pick<InferSelectModel<typeof schema.options>, 'id' | 'startsAt' | 'endsAt'>
		response: InferSelectModel<typeof schema.responses> | undefined
		error: Snippet
	}

	let { option, response, error }: Props = $props()

	let showNote = $state(response?.note && response.note.length > 0)
	let noteValue = $state(response?.note ?? '')

	const availabilityName = $derived(`availability.option_${option.id}`)
	const noteName = $derived(`note.option_${option.id}`)

	function handleAvailabilityChange(availability: string) {
		if (availability === 'MAYBE') showNote = true
		else if (noteValue.trim() === '') showNote = false
	}
</script>

<div class="px-5 py-4 pr-4 text-neutral-800 dark:text-neutral-200">
	<div class="grid items-center gap-x-6 gap-y-3 md:grid-cols-[1fr_auto]">
		<p class="font-[350] md:w-60 max-xs:w-60">{formatDateTimeRange(option)}</p>
		<div class="flex gap-2">
			<fieldset class="flex divide-x">
				<label class="group cursor-pointer">
					<input
						type="radio"
						name={availabilityName}
						value="YES"
						class="absolute opacity-0"
						checked={response?.availability === 'YES'}
						onchange={(e) => handleAvailabilityChange(e.currentTarget.value)}
					/>
					<span
						class="flex items-center gap-1.5 rounded-l-lg border border-r-0 px-3 py-2 text-sm leading-none transition-colors group-has-checked:bg-lime-300/75 group-has-checked:text-lime-900 dark:bg-neutral-800/50 dark:group-has-checked:bg-lime-500/25 dark:group-has-checked:text-lime-100"
					>
						<Icon icon="tabler--check" class="size-5" />
						<span class="max-xs:hidden">Ja</span>
					</span>
				</label>

				<label class="group cursor-pointer">
					<input
						type="radio"
						name={availabilityName}
						value="MAYBE"
						class="absolute opacity-0"
						checked={response?.availability === 'MAYBE'}
						onchange={(e) => handleAvailabilityChange(e.currentTarget.value)}
					/>
					<span
						class="flex items-center gap-1.5 border border-x-0 px-3 py-2 text-sm leading-none transition-colors group-has-checked:bg-amber-300/50 group-has-checked:text-amber-900 dark:bg-neutral-800/50 dark:group-has-checked:bg-amber-500/15 dark:group-has-checked:text-amber-100"
					>
						<Icon icon="tabler--question-mark" class="size-5" />
						<span class="max-xs:hidden">Misschien</span>
					</span>
				</label>

				<label class="group cursor-pointer">
					<input
						type="radio"
						name={availabilityName}
						value="NO"
						class="absolute opacity-0"
						checked={response?.availability === 'NO'}
						onchange={(e) => handleAvailabilityChange(e.currentTarget.value)}
					/>
					<span
						class="flex items-center gap-1.5 rounded-r-lg border border-l-0 px-3 py-2 text-sm leading-none transition-colors group-has-checked:bg-red-300/75 group-has-checked:text-red-900 dark:bg-neutral-800/50 dark:group-has-checked:bg-red-500/25 dark:group-has-checked:text-red-100"
					>
						<Icon icon="tabler--x" class="size-5" />
						<span class="max-xs:hidden">Nee</span>
					</span>
				</label>
			</fieldset>
			<button
				type="button"
				onclick={() => (showNote = !showNote)}
				class="flex cursor-pointer rounded-lg border p-2 text-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300"
				title={showNote ? 'Opmerking verwijderen' : 'Opmerking toevoegen'}
			>
				{#if showNote}
					<Icon icon="tabler--message-circle-x" class="size-5" />
					<span class="sr-only">Opmerking verwijderen voor {formatDateTimeRange(option)}</span>
				{:else}
					<Icon icon="tabler--message-circle" class="size-5" />
					<span class="sr-only">Opmerking toevoegen voor {formatDateTimeRange(option)}</span>
				{/if}
			</button>
		</div>
	</div>

	<div data-note={showNote ? 'show' : 'hide'}>
		<div>
			<textarea
				id={noteName}
				name={showNote ? noteName : undefined}
				class="mt-3 block min-h-12 w-full rounded-lg border px-4 py-2.5 font-[350] dark:bg-neutral-800/50"
				placeholder="Voeg een opmerking toe..."
				rows={1}
				bind:value={noteValue}
			></textarea>
		</div>
	</div>

	{@render error()}
</div>

<style>
	[data-note] {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 150ms ease;
		overflow: clip;
	}

	[data-note='show'] {
		grid-template-rows: 1fr;
	}

	[data-note] > div {
		min-height: 0;
	}
</style>
