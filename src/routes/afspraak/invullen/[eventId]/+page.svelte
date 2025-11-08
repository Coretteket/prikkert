<script lang="ts">
	import Button from '@/lib/components/button.svelte'
	import OptionInput from './option-input.svelte'
	import { page } from '$app/state'
	import { getEvent } from './get-event.remote'
	import { submitResponse } from './submit-response.remote'

	const data = $derived(await getEvent(page.params.eventId))

	const issues = $derived(submitResponse.fields.allIssues() ?? [])

	const availabilityErrorThreshold = $derived(Math.ceil(data.event.options.length * 0.2))

	const nameIssues = $derived(
		issues.filter((issue) => issue.path?.[0] === 'name').map((issue) => issue.message) ?? [],
	)

	const availabilityIssues = $derived(
		new Map(
			issues
				?.filter((issue) => issue.path?.[0]?.toString().startsWith('availability'))
				.map((issue) => [issue.path?.[0]?.toString() ?? '', issue.message]) ?? [],
		),
	)
</script>

<h1 class="font-display mb-8 text-2xl font-[550]">{data.event.title}</h1>

<p class="-mt-4 mb-6 font-[350] text-balance text-neutral-700 dark:text-neutral-300">
	Je bent uitgenodigd om je beschikbaarheid door te geven, zodat er een datum kan worden geprikt.
</p>

<form {...submitResponse}>
	<div class="mb-8">
		<label for="name" class="mb-4 block font-medium">
			Jouw naam
			{#if !data.event.disallowAnonymous}
				<span class="font-normal text-neutral-500 dark:text-neutral-400">(optioneel)</span>
			{/if}
		</label>
		<input
			type="text"
			id="name"
			name="name"
			class={[
				'mb-4 block w-full rounded-lg border px-4 py-2.5 text-lg dark:bg-neutral-800/50',
				nameIssues.length > 0 ? 'outline outline-pink-600 dark:outline-pink-500' : '',
			]}
			value={data.session?.name ?? ''}
		/>
		{#each nameIssues as issue}
			<p class="text-pink-600 dark:text-pink-500">{issue}</p>
		{/each}
	</div>

	<div class="mb-6">
		<p class="mb-4 block font-medium">Beschikbaarheid</p>
		<div
			class={[
				'mb-4 block divide-y rounded-lg border',
				availabilityIssues.size > 0 ? 'outline outline-pink-600 dark:outline-pink-500' : '',
			]}
		>
			{#each data.event.options as option}
				{@const availabilityName = `availability.option_${option.id}`}
				<OptionInput {option} response={data.session?.responses.get(option.id)}>
					{#snippet error()}
						{#if availabilityIssues.size <= availabilityErrorThreshold && availabilityIssues.has(availabilityName)}
							<p class="text-pink-600 dark:text-pink-500">
								{availabilityIssues.get(availabilityName)}
							</p>
						{/if}
					{/snippet}
				</OptionInput>
			{/each}
		</div>
		{#if availabilityIssues.has('availability') || availabilityIssues.size > availabilityErrorThreshold}
			<p class="text-pink-600 dark:text-pink-500">Vul je beschikbaarheid in voor alle opties.</p>
		{/if}
	</div>

	<Button type="submit" variant="primary" class="ml-auto">Beschikbaarheid opslaan</Button>
</form>
