<script lang="ts">
	import { enhance } from '$app/forms'
	import Button from '@/lib/components/button.svelte'
	import OptionInput from './option-input.svelte'

	let { data, form } = $props()

	const availabilityErrorTreshold = $derived(Math.ceil(data.event.options.length * 0.2))

	const availabilityErrors = $derived(
		new Map(
			form?.error.nested
				? Object.entries(form.error.nested).filter(([key]) => key.startsWith('availability.'))
				: [],
		),
	)
</script>

<h1 class="font-display mb-8 text-2xl font-[550]">{data.event.title}</h1>

<p class="-mt-4 mb-6 font-[350] text-balance text-neutral-700 dark:text-neutral-300">
	Je bent uitgenodigd om je beschikbaarheid door te geven, zodat er een datum kan worden geprikt.
</p>

<form method="POST" use:enhance>
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
				form?.error.nested?.name ? 'outline outline-pink-600 dark:outline-pink-500' : '',
			]}
			defaultValue={data.session?.name ?? ''}
		/>
		{#if form?.error.nested?.name}
			<p class="text-pink-600 dark:text-pink-500">{form.error.nested.name}</p>
		{/if}
	</div>

	<div class="mb-6">
		<p class="mb-4 block font-medium">Beschikbaarheid</p>
		<div
			class={[
				'mb-4 block divide-y rounded-lg border',
				availabilityErrors.size > 0 ? 'outline outline-pink-600 dark:outline-pink-500' : '',
			]}
		>
			{#each data.event.options as option}
				<OptionInput {option} response={data.session?.responses.get(option.id)}>
					{#snippet error()}
						{#if availabilityErrors.size <= availabilityErrorTreshold && availabilityErrors.has(`availability.${option.id}`)}
							<p class="text-pink-600 dark:text-pink-500">
								{availabilityErrors.get(`availability.${option.id}`)}
							</p>
						{/if}
					{/snippet}
				</OptionInput>
			{/each}
		</div>
		{#if availabilityErrors.size > availabilityErrorTreshold}
			<p class="text-pink-600 dark:text-pink-500">Vul je beschikbaarheid in voor alle opties.</p>
		{/if}
	</div>

	<Button type="submit" variant="primary" class="ml-auto">Beschikbaarheid opslaan</Button>
</form>
