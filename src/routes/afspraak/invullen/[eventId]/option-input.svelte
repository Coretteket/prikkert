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

	const availabilityName = $derived(`availability.option_${option.id}`)
	const noteName = $derived(`note.option_${option.id}`)
</script>

<div class="px-6 py-4 pr-4">
	<fieldset class="flex items-center gap-2">
		<p class="mr-2 grow">
			{formatDateTimeRange(option)}
		</p>
		<div class="flex divide-x">
			<label class="group cursor-pointer">
				<input
					type="radio"
					name={availabilityName}
					value="YES"
					class="absolute opacity-0"
					defaultChecked={response?.availability === 'YES'}
					checked={response?.availability === 'YES'}
				/>
				<span
					class="flex items-center gap-1.5 rounded-l-lg border border-r-0 px-3 py-2 text-sm leading-none transition-colors group-has-checked:bg-lime-300/75 group-has-checked:text-lime-900 dark:bg-neutral-800/50 dark:group-has-checked:bg-lime-500/25 dark:group-has-checked:text-lime-100"
				>
					<Icon icon="tabler--check" class="size-5" />
					Ja
				</span>
			</label>

			<label class="group cursor-pointer">
				<input
					type="radio"
					name={availabilityName}
					value="MAYBE"
					class="absolute opacity-0"
					defaultChecked={response?.availability === 'MAYBE'}
					checked={response?.availability === 'MAYBE'}
				/>
				<span
					class="flex items-center gap-1.5 border border-x-0 px-3 py-2 text-sm leading-none transition-colors group-has-checked:bg-amber-300/50 group-has-checked:text-amber-900 dark:bg-neutral-800/50 dark:group-has-checked:bg-amber-500/15 dark:group-has-checked:text-amber-100"
				>
					<Icon icon="tabler--question-mark" class="size-5" />
					Misschien
				</span>
			</label>

			<label class="group cursor-pointer">
				<input
					type="radio"
					name={availabilityName}
					value="NO"
					class="absolute opacity-0"
					defaultChecked={response?.availability === 'NO'}
					checked={response?.availability === 'NO'}
				/>
				<span
					class="flex items-center gap-1.5 rounded-r-lg border border-l-0 px-3 py-2 text-sm leading-none transition-colors group-has-checked:bg-red-300/75 group-has-checked:text-red-900 dark:bg-neutral-800/50 dark:group-has-checked:bg-red-500/25 dark:group-has-checked:text-red-100"
				>
					<Icon icon="tabler--x" class="size-5" />
					Nee
				</span>
			</label>
		</div>
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
	</fieldset>

	<div data-note={showNote ? 'show' : 'hide'}>
		{#key showNote}
			<div>
				<textarea
					id={noteName}
					name={showNote ? noteName : undefined}
					class="mt-3 block min-h-12 w-full rounded-lg border px-4 py-2.5 dark:bg-neutral-800/50"
					placeholder="Voeg een opmerking toe."
					rows={1}
					defaultValue={response?.note ?? ''}
					value={response?.note ?? ''}
				></textarea>
			</div>
		{/key}
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
