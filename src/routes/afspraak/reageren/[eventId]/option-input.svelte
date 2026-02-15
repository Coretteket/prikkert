<script lang="ts">
	import Button from '@/components/button.svelte'
	import Icon from '@/components/icon.svelte'
	import Date from '@/components/date.svelte'

	import type { getEventForSession } from './data.remote'

	import RadioButton from './option-input-button.svelte'

	type Props = {
		option: Awaited<ReturnType<typeof getEventForSession>>['options'][number]
		errors: Array<string | undefined>
		disabled?: boolean
	}

	let { option, errors, disabled }: Props = $props()

	let availability = $derived(option.response?.availability ?? '')
	let showNote = $derived(Boolean(option.response?.note))
	let noteValue = $derived(option.response?.note ?? '')

	const availabilityName = $derived(`availability.option_${option.id}`)
	const noteName = $derived(`note.option_${option.id}`)
</script>

<div class="py-4 text-neutral-800 max-md:pb-5 dark:text-neutral-200">
	<div class="grid min-h-12 items-center gap-x-6 gap-y-3 px-5 pr-4 md:grid-cols-[1fr_auto]">
		<div>
			<p>
				<Date {option} />
			</p>
			<p class="line-clamp-1 text-neutral-500 dark:text-neutral-400">
				{option.note}
			</p>
		</div>

		<div class="flex gap-2">
			<fieldset class="flex divide-x">
				<RadioButton
					{disabled}
					bind:availability
					name={availabilityName}
					value="YES"
					icon="tabler--check"
					label="Ja"
					class="rounded-l-lg border-r-0 group-has-checked:bg-lime-400/60 group-has-checked:text-lime-900 dark:group-has-checked:bg-lime-500/30 dark:group-has-checked:text-lime-200"
				/>
				<RadioButton
					{disabled}
					bind:availability
					name={availabilityName}
					value="MAYBE"
					icon="tabler--question-mark"
					label="Misschien"
					class="border-x-0 group-has-checked:bg-yellow-400/60 group-has-checked:text-yellow-900 dark:group-has-checked:bg-yellow-500/30 dark:group-has-checked:text-yellow-200"
				/>
				<RadioButton
					{disabled}
					bind:availability
					name={availabilityName}
					value="NO"
					icon="tabler--x"
					label="Nee"
					class="rounded-r-lg border-l-0 group-has-checked:bg-red-400/60 group-has-checked:text-red-900 dark:group-has-checked:bg-red-500/30 dark:group-has-checked:text-red-200"
				/>
			</fieldset>
			<Button
				variant="secondary"
				size="icon"
				class="px-2.5"
				label={showNote ? 'Opmerking verwijderen' : 'Opmerking toevoegen'}
				type="button"
				onclick={() => (showNote = !showNote)}
				{disabled}
			>
				{#if showNote}
					<Icon icon="tabler--message-circle-x" class="size-5" />
					<span class="sr-only">Opmerking verwijderen voor <Date {option} /></span>
				{:else}
					<Icon icon="tabler--message-circle" class="size-5" />
					<span class="sr-only">Opmerking toevoegen voor <Date {option} /></span>
				{/if}
			</Button>
		</div>
	</div>

	{#if showNote}
		<div data-desc class="-mb-1 px-5 pt-3 pb-1 md:px-4">
			<textarea
				{disabled}
				id={noteName}
				name={showNote ? noteName : undefined}
				class="block min-h-12 w-full rounded-lg border px-4 py-2.5 disabled:cursor-not-allowed dark:bg-neutral-800/50"
				placeholder="Voeg een opmerking toe..."
				rows={1}
				tabindex={showNote ? 0 : -1}
				spellcheck={false}
				bind:value={noteValue}
			></textarea>
		</div>
	{/if}

	{#each errors.filter((e) => e !== undefined) as error}
		<p class="mt-2 px-5 text-pink-600 dark:text-pink-500" data-issue>
			{error}
		</p>
	{/each}
</div>
