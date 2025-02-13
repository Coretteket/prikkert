<script lang="ts">
	import { enhance } from '$app/forms'
	import Button from '@/lib/components/button.svelte'
	import { formatDateTimeRange } from '@/lib/time-format'
	import { SvelteMap } from 'svelte/reactivity'

	let { form, data } = $props()

	type Availability = 'YES' | 'NO' | 'MAYBE'
	let availability = new SvelteMap<string, Availability>()
</script>

<h2 class="text-lg font-bold">{data.event.title}</h2>
{#if data.event.description}
	<p>Beschrijving: {data.event.description}</p>
{/if}
{#if data.event.location}
	<p>Locatie: {data.event.location}</p>
{/if}

<a href="/afspraak/overzicht/{data.event.id}" class="my-4 block text-zinc-500">Of bekijken.</a>

<form method="POST" use:enhance class="grid gap-4">
	<pre>{JSON.stringify(form, null, 2)}</pre>
	<label for="form-name" class="text-zinc-800">Jouw naam</label>
	<input
		name="name"
		id="form-name"
		type="text"
		class="rounded-md border border-zinc-300 px-3 py-2 placeholder:text-base placeholder:text-zinc-400"
		placeholder="Hoe wil je genoemd worden?"
		defaultValue={data.session?.name}
	/>

	<ul class="grid gap-4">
		{#each data.event.options as option}
			<li class="flex justify-between">
				<div class="my-2 font-medium">
					{formatDateTimeRange(option)}
				</div>
				<div class="flex gap-2 rounded">
					<Button
						type="button"
						color={availability.get(option.id) === 'YES' ? 'primary' : 'secondary'}
						onclick={() => availability.set(option.id, 'YES')}
					>
						Ja
					</Button>
					<Button
						type="button"
						color={availability.get(option.id) === 'NO' ? 'primary' : 'secondary'}
						onclick={() => availability.set(option.id, 'NO')}
					>
						Nee
					</Button>
					<Button
						type="button"
						color={availability.get(option.id) === 'MAYBE' ? 'primary' : 'secondary'}
						onclick={() => availability.set(option.id, 'MAYBE')}
					>
						Misschien
					</Button>

					<input
						type="hidden"
						name="options"
						value={JSON.stringify({
							optionId: option.id,
							availability: availability.get(option.id),
						})}
					/>
				</div>
			</li>
		{/each}
	</ul>

	<Button type="submit" color="primary" class="mt-4 ml-auto">Beschikbaarheid opslaan</Button>
</form>
