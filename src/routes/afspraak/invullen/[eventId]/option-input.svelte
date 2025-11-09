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

	let availabilityValue = $state(response?.availability ?? '')
	let showNote = $state(Boolean(response?.note))
	let noteValue = $state(response?.note ?? '')

	const availabilityName = $derived(`availability.${option.id}`)
	const noteName = $derived(`note.${option.id}`)

	function handleAvailabilityChange(availability: string) {
		if (availability === 'MAYBE') showNote = true
		else if (noteValue.trim() === '') showNote = false
	}
</script>

{#snippet radioButton(value: string, icon: string, label: string, classes: string)}
	<label class="group cursor-pointer">
		<input
			type="radio"
			name={availabilityName}
			{value}
			class="absolute opacity-0"
			bind:group={availabilityValue}
			onchange={(e) => handleAvailabilityChange(e.currentTarget.value)}
		/>
		<span
			class="flex items-center gap-1.5 px-3 py-2 text-sm leading-none transition-colors {classes}"
		>
			<Icon {icon} class="size-5" />
			<span class="max-xs:hidden">{label}</span>
		</span>
	</label>
{/snippet}

<div class="px-5 py-4 pr-4 text-neutral-800 dark:text-neutral-200">
	<div class="grid items-center gap-x-6 gap-y-3 md:grid-cols-[1fr_auto]">
		<p class="max-xs:w-60 font-[350] md:w-60">{formatDateTimeRange(option)}</p>
		<div class="flex gap-2">
			<fieldset class="flex divide-x">
				{@render radioButton(
					'YES',
					'tabler--check',
					'Ja',
					'rounded-l-lg border border-r-0 group-has-checked:bg-lime-300/75 group-has-checked:text-lime-900 dark:bg-neutral-800/50 dark:group-has-checked:bg-lime-500/25 dark:group-has-checked:text-lime-100',
				)}
				{@render radioButton(
					'MAYBE',
					'tabler--question-mark',
					'Misschien',
					'border border-x-0 group-has-checked:bg-amber-300/50 group-has-checked:text-amber-900 dark:bg-neutral-800/50 dark:group-has-checked:bg-amber-500/15 dark:group-has-checked:text-amber-100',
				)}
				{@render radioButton(
					'NO',
					'tabler--x',
					'Nee',
					'rounded-r-lg border border-l-0 group-has-checked:bg-red-300/75 group-has-checked:text-red-900 dark:bg-neutral-800/50 dark:group-has-checked:bg-red-500/25 dark:group-has-checked:text-red-100',
				)}
			</fieldset>
			<button
				type="button"
				onclick={() => {
					showNote = !showNote
					if (!showNote) setTimeout(() => (noteValue = ''), 150)
				}}
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
