<script lang="ts">
	import Button from '@/components/button.svelte'
	import Icon from '@/components/icon.svelte'

	import { faq, promises, steps } from './content'
</script>

<header class="mt-10 sm:mt-14 mb-24 sm:mb-30 space-y-4">
	<h2
		class="font-display mb-8 text-center text-4xl font-semibold text-neutral-900 sm:text-5xl sm:leading-tight dark:text-neutral-100"
	>
		<p>Samen plannen,</p>
		<p>zo geprikt</p>
	</h2>
	<h3
		class="mx-auto mb-8 max-w-80 text-center text-xl font-[350] text-balance text-neutral-700 sm:max-w-100 dark:text-neutral-300"
	>
		Vind
		<strong class="font-bold text-pink-700 dark:text-white">gratis</strong>
		én
		<strong class="font-bold text-pink-700 dark:text-white">reclamevrij</strong>
		het beste moment voor elke groepsafspraak.
	</h3>
	<Button as="link" href="/afspraak/aanmaken" variant="primary" size="lg" class="mx-auto">
		Afspraak aanmaken
	</Button>
</header>

<section class="mb-20">
	<h3 class="font-display mb-4 text-center text-xl font-semibold">Waarom Prikkert?</h3>
	<p
		class="class mx-auto mb-10 max-w-100 text-center text-balance text-neutral-600 dark:text-neutral-300"
	>
		Datumprikken kan ook zonder verdienmodel. Daarom doet Prikkert vier beloftes.
	</p>
	<div class="mb-8 grid gap-4 sm:grid-cols-2">
		{#each promises as promise}
			<div
				class="rounded-lg border from-neutral-900 to-pink-700/5 px-7 py-6.5 dark:bg-linear-to-tl"
			>
				<div class="mb-4 flex items-center gap-4">
					<div class="squircle flex w-fit bg-pink-500/25 p-2.5 text-pink-700 dark:text-pink-100">
						<Icon icon={promise.icon} class="size-6" />
					</div>
					<h4 class="font-display text-xl font-medium text-neutral-800 dark:text-neutral-200">
						{promise.title}
					</h4>
				</div>
				<p class="font-[350] text-balance text-neutral-600 dark:text-pink-50/70">
					{promise.description}
				</p>
			</div>
		{/each}
	</div>
	<Button as="link" href="#faq" variant="tertiary" class="mx-auto">Hoe werkt dat?</Button>
</section>

<section class="mb-20">
	<h3 class="font-display mb-4 text-center text-xl font-semibold">Hoe gebruik je Prikkert?</h3>
	<p
		class="class mx-auto mb-10 max-w-100 text-center text-balance text-neutral-600 dark:text-neutral-300"
	>
		Plan jouw groepsafspraak in drie simpele stappen.
	</p>
	<div class="mx-auto max-w-130">
		{#each steps as step, i}
			<div class="mb-8 flex items-start gap-4">
				<div class="squircle flex aspect-square h-9 w-9 items-center justify-center bg-pink-500/25">
					<p class="font-semibold text-pink-700 dark:text-pink-100">
						{i + 1}
					</p>
				</div>
				<p class="text-neutral-700 sm:text-lg dark:text-neutral-300">
					<b class="font-semibold text-neutral-800 dark:text-neutral-200">{step.bold}</b>
					{step.normal}
				</p>
			</div>
		{/each}
	</div>
	<Button as="link" href="/afspraak/aanmaken" variant="tertiary" class="mx-auto">
		Begin met plannen
	</Button>
</section>

<section>
	<h3 class="font-display mb-4 text-center text-xl font-semibold" id="faq">Hoe werkt Prikkert?</h3>
	<p
		class="class mx-auto mb-10 max-w-100 text-center text-balance text-neutral-600 dark:text-neutral-300"
	>
		Vind de antwoorden op veelgestelde vragen.
	</p>
	<div class="mx-auto max-w-130">
		{#each faq as { question, answer }, i}
			<details
				class="group mb-3 pb-3 not-last-of-type:border-b motion-safe:transition"
				name="faq-item"
				open={i === 0}
			>
				<summary
					class="flex py-1 rounded cursor-pointer list-none justify-between gap-2 font-medium text-neutral-800 dark:text-neutral-200"
				>
					<span class="not-group-open:truncate" title={question}>{question}</span>
					<Icon
						icon="tabler--chevron-right"
						class="my-0.5 size-5 duration-100 group-open:rotate-90 motion-safe:transition"
					/>
				</summary>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<p class="pt-1 pb-2 text-neutral-600 dark:text-neutral-300">{@html answer}</p>
			</details>
		{/each}
	</div>
	<Button as="link" href="mailto:prikkert@qntn.io" variant="tertiary" class="mx-auto">
		Neem contact op
	</Button>
</section>

<footer class="p-4 pt-12 text-center text-sm text-balance text-neutral-400">
	Prikkert is
	<a href="https://github.com/coretteket/prikkert" target="_blank" class="underline">
		open source
	</a>, vrijgegeven onder de
	<a href="https://eupl.eu/1.2/nl/" target="_blank" class="underline">EUPL</a>.
</footer>
