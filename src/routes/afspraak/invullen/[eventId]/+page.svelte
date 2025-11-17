<script lang="ts">
	import { enhance } from '$app/forms'

	import Button from '@/components/button.svelte'
	import { keys } from '@/utils'

	import OptionInput from './option-input.svelte'

	let { data, form } = $props()

	let isSubmitting = $state(false)

	const availabilityErrorThreshold = $derived(Math.ceil(data.event.options.length * 0.2))

	const extractIssues = (prefix: string) =>
		new Map(
			keys(form?.error?.nested ?? {}).flatMap((key) =>
				key.startsWith(prefix) ? [[key.replace(prefix, ''), form!.error!.nested![key]]] : [],
			),
		)

	let availabilityIssues = $derived(extractIssues('availability.'))
	let noteIssues = $derived(extractIssues('note.'))
</script>

<h1 class="font-display capitalize-first mb-6 text-2xl font-[550]">{data.event.title}</h1>

{#if data.event.description}
	<p
		class="mb-6 border-b pb-6 text-lg font-[350] text-balance text-neutral-700 dark:text-neutral-300"
	>
		{data.event.description}
	</p>
{/if}

<p class="mb-10 text-lg font-[350] text-balance text-neutral-700 dark:text-neutral-300">
	Je bent uitgenodigd om je beschikbaarheid door te geven, zodat er een datum kan worden geprikt.
</p>

<form
	method="POST"
	use:enhance={() => {
		isSubmitting = true
		return ({ update }) => update({ reset: false }).finally(() => (isSubmitting = false))
	}}
>
	<div class="mb-8">
		<label for="name" class="mb-4 block font-medium">
			Jouw naam
			{#if data.event.allowAnonymous}
				<span class="font-normal text-neutral-500 dark:text-neutral-400">(optioneel)</span>
			{/if}
		</label>
		<input
			type="text"
			id="name"
			name="name"
			autocomplete="name"
			class={[
				'mb-4 block w-full rounded-lg border px-4 py-2.5 text-lg dark:bg-neutral-800/50',
				form?.error?.nested?.name && form.error.nested.name.length > 0 && 'ring ring-pink-500',
			]}
			value={data.session?.name ?? ''}
		/>
		{#each form?.error?.nested?.name as issue}
			<p class="font-medium text-pink-600 dark:text-pink-500">{issue}</p>
		{/each}
	</div>

	<div class="mb-6">
		<p class="mb-4 block font-medium">Beschikbaarheid</p>
		<div
			class={[
				'mb-4 block divide-y rounded-lg border',
				(availabilityIssues.size > 0 || noteIssues.size > 0) && 'ring ring-pink-500',
			]}
		>
			{#each data.event.options as option (option.id)}
				<OptionInput {option} response={data.session?.responses.get(option.id)}>
					{#snippet error()}
						{#if availabilityIssues.size <= availabilityErrorThreshold && availabilityIssues.has(option.id)}
							{#each availabilityIssues.get(option.id) as issue}
								<p class="mt-2 font-medium text-pink-600 dark:text-pink-500">
									{issue}
								</p>
							{/each}
						{/if}
						{#if noteIssues.has(option.id)}
							{#each noteIssues.get(option.id) as issue}
								<p class="mt-2 font-medium text-pink-600 dark:text-pink-500">
									{issue}
								</p>
							{/each}
						{/if}
					{/snippet}
				</OptionInput>
			{/each}
		</div>
		{#if form?.error?.nested?.availability || availabilityIssues.size > availabilityErrorThreshold}
			<p class="font-medium text-pink-600 dark:text-pink-500">Vul je beschikbaarheid in voor alle opties.</p>
		{/if}
	</div>

	<Button
		type="submit"
		variant="primary"
		class={['ml-auto', isSubmitting && 'animate-pulse']}
		disabled={isSubmitting}
	>
		Beschikbaarheid opslaan
	</Button>
</form>
