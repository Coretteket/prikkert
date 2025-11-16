<script lang="ts">
	import { formatDateTimeOption } from '@/lib/time-format'
	import Icon from '@/lib/components/icon.svelte'

	let { data } = $props()

	function sortResponses(responses: (typeof data)['event']['options'][number]['responses']) {
		const order = { YES: 0, MAYBE: 1, NO: 2 }
		return responses.toSorted((a, b) => order[a.availability] - order[b.availability])
	}
</script>

<h1 class="font-display capitalize-first mb-6 text-2xl font-[550]">{data.event.title}</h1>

{#if data.event.description}
	<p
		class="mb-6 border-b pb-6 text-lg font-[350] text-balance text-neutral-700 dark:text-neutral-300"
	>
		{data.event.description}
	</p>
{/if}

<div class="mb-6">
	<p class="mb-4 block font-medium">Beschikbaarheid</p>
	<div class="mb-4 block divide-y overflow-hidden rounded-lg border">
		{#each data.event.options as option (option.id)}
			<details class="group">
				<summary
					class="flex cursor-pointer flex-col px-5 py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
				>
					<p class="mb-2">{formatDateTimeOption(option)}</p>
					<div role="progressbar" class="flex divide-x overflow-hidden rounded-lg border">
						{#each ['YES', 'MAYBE', 'NO'] as availability}
							{@const number = option.responses.filter(
								(r) => r.availability === availability,
							).length}
							{@const percentage = (number / option.responses.length) * 100}
							{#if percentage > 0}
								<div
									style="width: {percentage}%"
									class={[
										'@container shrink-0 px-2 py-1 text-sm font-bold',
										{
											'bg-lime-400 text-lime-900': availability === 'YES',
											'bg-red-400 text-red-900': availability === 'NO',
											'bg-amber-400 text-amber-900': availability === 'MAYBE',
										},
									]}
								>
									<span class="flex items-center gap-1 @max-[35px]:invisible">
										<Icon icon="tabler--user-filled" class="size-3" />
										{number}
									</span>
								</div>
							{/if}
						{/each}
					</div>
				</summary>

				<div class="space-y-2 border-t py-4 sm:columns-2">
					{#each sortResponses(option.responses) as response}
						<div class="flex gap-3 px-5">
							<Icon
								title={{
									YES: 'Ja',
									MAYBE: 'Misschien',
									NO: 'Nee',
								}[response.availability]}
								icon={{ YES: 'tabler--check', MAYBE: 'tabler--question-mark', NO: 'tabler--x' }[
									response.availability
								]}
								class={[
									'size-6',
									{
										'text-lime-600 dark:text-lime-400': response.availability === 'YES',
										'text-amber-600 dark:text-amber-400': response.availability === 'MAYBE',
										'text-red-600 dark:text-red-400': response.availability === 'NO',
									},
								]}
							/>
							<div class="flex flex-1 flex-col">
								<p class="font-[450]">{response.session.name || 'Anonieme deelnemer'}</p>
								{#if response.note}
									<p class="mt-0.5 text-sm text-neutral-600 dark:text-neutral-300">
										{response.note}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</details>
		{/each}
	</div>
</div>
