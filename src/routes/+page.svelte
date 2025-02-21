<script lang="ts">
	import { IconChevronRight } from '@tabler/icons-svelte'
	import { faq, promises, steps } from './content'

	let openAccordion = $state(0)
</script>

<header class="mt-10 mb-24 space-y-4">
	<h2
		class="font-display mb-8 text-center text-4xl font-semibold text-zinc-900 sm:text-[2.75rem] sm:leading-tight dark:text-zinc-100"
	>
		<p>Samen plannen,</p>
		<p>zo geprikt</p>
	</h2>
	<h3
		class="mx-auto mb-8 max-w-80 text-center text-xl font-[350] text-balance text-zinc-700 sm:max-w-100 dark:text-zinc-300"
	>
		Vind
		<strong class="font-semibold text-pink-700 dark:text-zinc-200">gratis</strong>
		én
		<strong class="font-semibold text-pink-700 dark:text-zinc-200">reclamevrij</strong>
		het beste moment voor elke groepsafspraak.
	</h3>
	<a
		href="/afspraak/aanmaken"
		class="mx-auto block w-fit rounded-lg bg-pink-700 px-4 py-2 text-lg font-semibold text-white shadow transition hover:bg-pink-800 dark:bg-pink-800 dark:text-zinc-100 dark:hover:bg-pink-900"
	>
		Afspraak aanmaken
	</a>
</header>

<section class="mb-20">
	<h3 class="font-display mb-4 text-center text-xl font-semibold">Waarom Prikkert?</h3>
	<p
		class="class mx-auto mb-10 max-w-100 text-center text-balance text-zinc-600 dark:text-zinc-300"
	>
		Datumprikken kan ook zonder verdienmodel. Daarom doet Prikkert vier beloftes.
	</p>
	<div class="mb-8 grid gap-4 sm:grid-cols-2">
		{#each promises as promise}
			<div
				class="rounded-lg border from-zinc-900 to-pink-700/5 px-6 py-5 dark:border-zinc-800 dark:bg-gradient-to-tl"
			>
				<div class="mb-4 flex items-center gap-4">
					<div
						class="aspect-square w-fit rounded-lg bg-pink-500/20 p-2.5 text-pink-700 dark:text-pink-100"
					>
						<promise.icon />
					</div>
					<h4 class="font-display text-xl font-medium text-zinc-800 dark:text-zinc-200">
						{promise.title}
					</h4>
				</div>
				<p class="font-[350] text-balance text-zinc-600 dark:text-pink-50/70">
					{promise.description}
				</p>
			</div>
		{/each}
	</div>
	<a
		href="#faq"
		class="mx-auto flex w-fit font-medium text-pink-600 hover:underline dark:text-pink-500"
	>
		Hoe werkt dat?
	</a>
</section>

<section class="mb-20">
	<h3 class="font-display mb-4 text-center text-xl font-semibold">Hoe gebruik je Prikkert?</h3>
	<p
		class="class mx-auto mb-10 max-w-100 text-center text-balance text-zinc-600 dark:text-zinc-300"
	>
		Plan jouw groepsafspraak in drie simpele stappen.
	</p>
	<div class="mx-auto max-w-130">
		{#each steps as step, i}
			<div class="mb-8 flex items-start gap-4">
				<div
					class="flex aspect-square h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10"
				>
					<p class="font-semibold text-pink-700 dark:text-pink-100">
						{i + 1}
					</p>
				</div>
				<p class="text-zinc-700 sm:text-lg dark:text-zinc-300">
					<b class="font-semibold text-zinc-800 dark:text-zinc-200">{step.bold}</b>
					{step.normal}
				</p>
			</div>
		{/each}
	</div>
	<a
		href="/afspraak/aanmaken"
		class="mx-auto flex w-fit font-medium text-pink-600 hover:underline dark:text-pink-500"
	>
		Begin met plannen
	</a>
</section>

<section>
	<h3 class="font-display mb-4 text-center text-xl font-semibold" id="faq">Hoe werkt Prikkert?</h3>
	<p
		class="class mx-auto mb-10 max-w-100 text-center text-balance text-zinc-600 dark:text-zinc-300"
	>
		Vind de antwoorden op veelgestelde vragen.
	</p>
	<div class="mx-auto max-w-130">
		{#each faq as { question, answer }, i}
			<details
				class="group mb-4 pb-4 transition not-last-of-type:border-b"
				open={openAccordion === i}
			>
				<summary
					class="flex cursor-pointer list-none justify-between gap-2 font-medium text-zinc-800 dark:text-zinc-200"
					onclick={(e) => {
						e.preventDefault()
						openAccordion = openAccordion === i ? -1 : i
					}}
				>
					<span class="not-group-open:truncate" title={question}>{question}</span>
					<IconChevronRight class="my-0.5 size-5 transition group-open:rotate-90" />
				</summary>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<p class="pt-2 text-zinc-600 dark:text-zinc-300">{@html answer}</p>
			</details>
		{/each}
	</div>
	<a
		href="mailto:prikkert@qntn.io"
		class="mx-auto flex w-fit font-medium text-pink-600 hover:underline dark:text-pink-500"
	>
		Neem contact op
	</a>
</section>

<footer class="p-4 pt-12 text-center text-sm text-balance text-zinc-400 dark:text-zinc-600">
	Prikkert is
	<a href="https://github.com/coretteket/prikkert" target="_blank" class="underline">
		open source
	</a>, vrijgegeven onder de
	<a href="https://eupl.eu/1.2/nl/" target="_blank" class="underline">EUPL-licentie</a>.
</footer>

<style>
	@supports selector(::details-content) {
		::details-content {
			height: 0;
			transition:
				height 0.3s ease,
				content-visibility 0.3s ease allow-discrete;
			overflow: clip;
		}

		details[open]::details-content {
			height: auto;
		}
	}
</style>
