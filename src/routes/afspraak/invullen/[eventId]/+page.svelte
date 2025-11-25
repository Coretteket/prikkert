<script lang="ts">
	import { submitAvailability } from '@/remote/submit-availability.remote'
	import { getEventSession } from '@/remote/get-event-session.remote'
	import Button from '@/components/button.svelte'
	import { noReset } from '@/utils'

	import OptionInput from './option-input.svelte'

	let { params } = $props()

	const { event, session } = $derived(await getEventSession(params.eventId))
	const availabilityErrorThreshold = $derived(Math.ceil(event.options.length * 0.2))

	function extractIssues(prefix: string) {
		const entries = (submitAvailability.fields.allIssues() ?? []).flatMap((issue) => {
			if (!issue.path?.[0]?.toString().startsWith(prefix)) return []
			return [[issue.path![0], issue.message] as const]
		})
		return new Map(entries)
	}

	const availabilityIssues = $derived(extractIssues('availability'))
	const noteIssues = $derived(extractIssues('note'))
</script>

<h1 class="font-display capitalize-first mb-6 text-2xl font-[550]">{event.title}</h1>

{#if event.description}
	<p
		class="mb-6 border-b pb-6 text-lg font-[350] text-balance text-neutral-700 dark:text-neutral-300"
	>
		{event.description}
	</p>
{/if}

<p class="mb-10 text-lg font-[350] text-balance text-neutral-700 dark:text-neutral-300">
	Je bent
	{#if event.organizerName}door <strong class="font-medium text-neutral-800 dark:text-neutral-200">
			{event.organizerName}
		</strong>{/if}
	uitgenodigd om je beschikbaarheid in te vullen, zodat er een datum kan worden geprikt.
</p>

<form {...submitAvailability.enhance(noReset)}>
	<div class="mb-8">
		<label for="name" class="mb-4 block font-medium">
			Jouw naam
			{#if event.allowAnonymous}
				<span class="font-normal text-neutral-500 dark:text-neutral-400">(optioneel)</span>
			{/if}
		</label>
		<input
			type="text"
			id="name"
			name="name"
			placeholder="Vul jouw naam in..."
			autocomplete="name"
			class={[
				'mb-4 block w-full rounded-lg border px-4 py-2.5 text-lg dark:bg-neutral-800/50',
				(submitAvailability.fields?.name?.issues()?.length ?? 0) > 0 && 'ring-2 ring-pink-500',
			]}
			value={session?.name ?? ''}
		/>
		{#each submitAvailability.fields?.name?.issues() ?? [] as issue}
			<p class="font-medium text-pink-600 dark:text-pink-500">{issue.message}</p>
		{/each}
	</div>

	<div class="mb-6">
		<p class="mb-4 block font-medium">Beschikbaarheid</p>
		<div
			class={[
				'mb-4 block divide-y rounded-lg border',
				(availabilityIssues.size > 0 || noteIssues.size > 0) && 'ring-2 ring-pink-500',
			]}
		>
			{#each event.options as option (option.id)}
				<OptionInput
					{option}
					response={session?.responses.get(option.id)}
					errors={[
						availabilityIssues.size <= availabilityErrorThreshold
							? availabilityIssues.get(`availability.option_${option.id}`)
							: undefined,
						noteIssues.get(`note.option_${option.id}`),
					]}
				/>
			{/each}
		</div>
		{#if (submitAvailability.fields?.availability?.issues()?.length ?? 0) > 0 || availabilityIssues.size > availabilityErrorThreshold}
			<p class="font-medium text-pink-600 dark:text-pink-500">
				Vul je beschikbaarheid in voor alle opties.
			</p>
		{/if}
	</div>

	<Button type="submit" variant="primary" class="ml-auto" disabled={submitAvailability.pending > 0}>
		Beschikbaarheid opslaan
	</Button>
</form>
