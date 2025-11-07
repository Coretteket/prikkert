<script lang="ts">
	import { enhance } from '$app/forms'
	import { formatDateTimeRange } from '@/lib/time-format'
	import {
		IconCheck,
		IconMessage,
		IconMessageCircle,
		IconQuestionMark,
		IconX,
	} from '@tabler/icons-svelte'
	import pattern from '@/lib/assets/pattern.svg'

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

<!-- <div class="relative mt-4 mb-8 rounded-lg border">
	<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-900 px-6 text-zinc-400">
		Beschikbaarheid invullen
	</div>

	<h1 class="font-display my-10 text-center text-2xl font-[550] drop-shadow">{data.event.title}</h1>

	{#if data.event.description}
		<p class="-mt-4 mb-6 mx-6 font-[350] text-zinc-700 dark:text-zinc-300">
			{data.event.description}
		</p>
	{/if}
</div> -->

<!-- <div class="text-zinc-600 dark:text-zinc-400 text-sm">INVULLEN</div> -->

<h1 class="font-display mb-8 text-2xl font-[550]">{data.event.title}</h1>

<p class="-mt-4 mb-6 font-[350] text-balance text-zinc-700 dark:text-zinc-300">
	Je bent uitgenodigd om je beschikbaarheid door te geven, zodat er een datum kan worden geprikt.
</p>

<form method="POST" use:enhance>
	<div class="mb-8">
		<label for="name" class="mb-4 block font-medium">
			Jouw naam
			{#if !data.event.disallowAnonymous}
				<span class="font-normal text-zinc-500 dark:text-zinc-400">(optioneel)</span>
			{/if}
		</label>
		<input
			type="text"
			id="name"
			name="name"
			class={[
				'mb-4 block w-full rounded-lg border px-4 py-2.5 text-lg dark:bg-zinc-800/50',
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
				<div class="px-6 py-4 pr-4">
					<fieldset class="flex items-center gap-2">
						<p class="mr-2 grow">
							{formatDateTimeRange(option)}
							<!-- donderdag 30 september 2025, 20:08 - 22:08 -->
						</p>
						<div class="flex divide-x">
							<label class="group cursor-pointer">
								<input
									type="radio"
									name="availability.{option.id}"
									value="YES"
									class="absolute opacity-0"
									defaultChecked={data.session?.responses.get(option.id) === 'YES'}
								/>
								<span
									class="flex items-center gap-1.5 rounded-l-lg border border-r-0 px-3 py-2 text-sm transition-colors group-has-checked:bg-lime-300/75 group-has-checked:text-lime-900 dark:bg-zinc-800/50 dark:group-has-checked:bg-lime-500/25 dark:group-has-checked:text-lime-100"
								>
									<IconCheck class="size-4.5" />
									Ja
								</span>
							</label>

							<label class="group cursor-pointer">
								<input
									type="radio"
									name="availability.{option.id}"
									value="MAYBE"
									class="absolute opacity-0"
									defaultChecked={data.session?.responses.get(option.id) === 'MAYBE'}
								/>
								<span
									class="flex items-center gap-1.5 border border-x-0 px-3 py-2 text-sm transition-colors group-has-checked:bg-amber-300/50 group-has-checked:text-amber-900 dark:bg-zinc-800/50 dark:group-has-checked:bg-amber-500/15 dark:group-has-checked:text-amber-100"
								>
									<IconQuestionMark class="size-4.5" />
									Misschien
								</span>
							</label>

							<label class="group cursor-pointer">
								<input
									type="radio"
									name="availability.{option.id}"
									value="NO"
									class="absolute opacity-0"
									defaultChecked={data.session?.responses.get(option.id) === 'NO'}
								/>
								<span
									class="flex items-center gap-1.5 rounded-r-lg border border-l-0 px-3 py-2 text-sm transition-colors group-has-checked:bg-red-300/75 group-has-checked:text-red-900 dark:bg-zinc-800/50 dark:group-has-checked:bg-red-500/25 dark:group-has-checked:text-red-100"
								>
									<IconX class="size-4.5" />
									Nee
								</span>
							</label>
						</div>
						<!-- <button
							class="rounded-lg border p-2 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300"
						>
							<IconMessageCircle class="size-4.5" />
						</button> -->
					</fieldset>

					<!-- <p class="text-right text-sm mt-2 text-zinc-400">Opmerking toevoegen</p> -->

					{#if availabilityErrors.size <= availabilityErrorTreshold && availabilityErrors.has(`availability.${option.id}`)}
						<p class="text-pink-600 dark:text-pink-500">
							{availabilityErrors.get(`availability.${option.id}`)}
						</p>
					{/if}
				</div>
			{/each}
		</div>
		{#if availabilityErrors.size > availabilityErrorTreshold}
			<p class="text-pink-600 dark:text-pink-500">Vul je beschikbaarheid in voor alle opties.</p>
		{/if}
	</div>

	<button
		type="submit"
		class="ml-auto block w-fit rounded-lg bg-pink-700 px-4 py-2 font-semibold text-white shadow transition hover:bg-pink-800 dark:bg-pink-800 dark:text-zinc-100 dark:hover:bg-pink-900"
	>
		Beschikbaarheid opslaan
	</button>
</form>
