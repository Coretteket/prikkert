<script lang="ts">
	import Button from '@/components/button.svelte'
	import { noReset } from '@/shared/utils'

	import OrganizerReceiveDialog from '../../overzicht/[eventId]/organizer-receive-dialog.svelte'
	import { submitAvailability } from './action.remote'
	import { getEventForSession } from './data.remote'
	import OptionInput from './option-input.svelte'

	let { params } = $props()

	const issues = $derived(submitAvailability.fields.allIssues() ?? [])

	$effect(() => {
		if (issues.length === 0) return
		document.querySelector('[data-issue]')?.parentElement?.scrollIntoView({ behavior: 'smooth' })
	})

	function extractIssues(prefix: string) {
		const entries = issues.flatMap((issue) => {
			if (!issue.path?.[0]?.toString().startsWith(prefix)) return []
			return [[issue.path![0], issue.message] as const]
		})
		return new Map(entries)
	}

	const availabilityIssues = $derived(extractIssues('availability'))
	const noteIssues = $derived(extractIssues('note'))

	const ISSUE_THRESHOLD = 3

	// Has to be at bottom until issue fixed: https://github.com/sveltejs/svelte/issues/17261
	const event = $derived(await getEventForSession(params.eventId))
</script>

<h1 class="mb-6 text-2xl font-[520] xs:text-3xl xs:font-medium">{event.title}</h1>

<p class="mb-10 text-[17px] text-balance text-neutral-700 xs:text-lg dark:text-neutral-300">
	Je bent
	{#if event.organizerName}
		door
		<strong class="font-medium text-neutral-800 dark:text-neutral-200">
			{event.organizerName}
		</strong>
	{/if}
	uitgenodigd om je beschikbaarheid in te vullen.
</p>

{#if event.description}
	<div class="mb-10">
		<p class="text-lg font-medium">Omschrijving</p>

		<p class="my-4 text-balance text-neutral-700 dark:text-neutral-300">
			{event.description}
		</p>
	</div>
{/if}

<form {...submitAvailability.enhance(noReset)}>
	<div class="mb-10">
		<label for="name" class="mb-4 block text-lg font-medium">
			Naam
			{#if event.allowAnonymous}
				<span class="font-normal text-neutral-500 dark:text-neutral-400">(optioneel)</span>
			{/if}
		</label>
		<input
			id="name"
			type="text"
			name="name"
			value={event.responseName}
			placeholder="Vul jouw naam in..."
			autocomplete="name"
			class={[
				'mb-4 block w-full rounded-lg border px-4 py-2.5 text-lg dark:bg-neutral-800/50',
				(submitAvailability.fields?.name?.issues()?.length ?? 0) > 0 && 'ring-2 ring-pink-500',
			]}
		/>
		{#each submitAvailability.fields?.name?.issues() ?? [] as issue}
			<p class="font-medium text-pink-600 dark:text-pink-500" data-issue>{issue.message}</p>
		{/each}
	</div>

	<div class="mb-10">
		<p class="mb-4 block text-lg font-medium">Beschikbaarheid</p>
		<div
			class={[
				'mb-4 block divide-y rounded-lg border',
				(availabilityIssues.size > 0 || noteIssues.size > 0) && 'ring-2 ring-pink-500',
			]}
		>
			{#each event.options as option (option.id)}
				<OptionInput
					{option}
					errors={[
						availabilityIssues.size <= ISSUE_THRESHOLD
							? availabilityIssues.get(`availability.option_${option.id}`)
							: undefined,
						noteIssues.get(`note.option_${option.id}`),
					]}
				/>
			{/each}
		</div>
		{#if (submitAvailability.fields?.availability?.issues()?.length ?? 0) > 0 || availabilityIssues.size > ISSUE_THRESHOLD}
			<p class="font-medium text-pink-600 dark:text-pink-500" data-issue>
				Vul je beschikbaarheid in voor alle opties.
			</p>
		{/if}
	</div>

	<Button type="submit" variant="primary" disabled={submitAvailability.pending > 0} class="ml-auto">
		Beschikbaarheid opslaan
	</Button>
</form>

<OrganizerReceiveDialog id={event.id} isOrganizer={event.isOrganizer} />
