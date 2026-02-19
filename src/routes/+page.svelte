<script lang="ts">
	import { faq, promises, steps } from '@/shared/content'
	import Button from '@/components/button.svelte'
	import Icon from '@/components/icon.svelte'
</script>

<header class="mt-8 mb-24 space-y-4 sm:mt-10 sm:mb-28">
	<h2
		class="mb-8 text-center text-[2.2rem] leading-[1.2] font-[650] text-neutral-900 xs:text-[2.5rem] sm:text-5xl dark:text-neutral-100"
	>
		<p>Samen plannen,</p>
		<p>zo geprikt</p>
	</h2>
	<h3
		class="mx-auto mb-8 max-w-80 text-center text-xl leading-normal text-balance text-neutral-700 sm:max-w-100 dark:text-neutral-300"
	>
		Vind
		<strong class="font-bold text-pink-600 dark:text-pink-50">gratis</strong>
		en
		<strong class="font-bold text-pink-600 dark:text-pink-50">reclamevrij</strong>
		het beste moment voor elke groepsafspraak.
	</h3>
	<Button as="link" href="/afspraak/aanmaken" variant="primary" size="lg" class="mx-auto">
		Afspraak aanmaken
	</Button>
</header>

<section class="mb-20">
	<h3 class="mb-4 text-center text-xl font-semibold xs:text-2xl">Waarom Prikkert?</h3>
	<p
		class="mx-auto mb-12 max-w-100 text-center font-medium text-balance text-neutral-600 dark:text-neutral-300"
	>
		Datumprikken kan ook zonder verdienmodel. Daarom doet Prikkert vier beloftes.
	</p>
	<div class="mb-8 grid gap-4 sm:grid-cols-2">
		{#each promises as promise}
			<div
				class="rounded-lg border from-neutral-900 to-pink-700/5 px-7 py-6.5 dark:bg-linear-to-tl"
			>
				<div class="mb-4 flex items-center gap-4">
					<div class="flex w-fit squircle bg-pink-500/30 p-2.5 text-pink-600 dark:text-pink-100">
						<Icon icon={promise.icon} class="size-6" />
					</div>
					<h4 class="text-xl font-[550] text-neutral-800 dark:text-neutral-200">
						{promise.title}
					</h4>
				</div>
				<p class="text-balance text-neutral-700 dark:text-pink-50/75">
					{promise.description}
				</p>
			</div>
		{/each}
	</div>
	<Button as="link" href="#faq" variant="tertiary" class="mx-auto">Hoe werkt dat?</Button>
</section>

<section class="mb-20">
	<h3 class="mb-4 text-center text-xl font-semibold xs:text-2xl">Hoe gebruik je Prikkert?</h3>
	<p
		class="mx-auto mb-12 max-w-100 text-center font-medium text-balance text-neutral-600 dark:text-neutral-300"
	>
		Plan jouw groepsafspraak in drie simpele stappen.
	</p>
	<div class="mx-auto max-w-130">
		{#each steps as step, i}
			<div class="mb-8 flex items-start gap-4">
				<div class="flex aspect-square size-8 items-center justify-center squircle bg-pink-500/30">
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
	<h3 class="mb-4 text-center text-xl font-semibold xs:text-2xl" id="faq">Hoe werkt Prikkert?</h3>
	<p
		class="mx-auto mb-12 max-w-100 text-center font-medium text-balance text-neutral-600 dark:text-neutral-300"
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
					class="flex cursor-pointer list-none justify-between gap-2 rounded py-1 font-semibold text-neutral-800 sm:text-lg sm:font-medium dark:text-neutral-200"
				>
					<span class="not-group-open:truncate" title={question}>{question}</span>
					<Icon
						icon="tabler--chevron-right"
						class="my-0.5 size-5 duration-100 group-open:rotate-90 motion-safe:transition"
					/>
				</summary>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<p class="pt-2 pb-2 text-neutral-800 dark:text-neutral-200">{@html answer}</p>
			</details>
		{/each}
	</div>
	<Button as="link" href="mailto:prikkert@qntn.io" variant="tertiary" class="mx-auto">
		Neem contact op
	</Button>
</section>

<style>
	@supports selector(::details-content) and (not (-moz-appearance: none)) {
		@media (prefers-reduced-motion: no-preference) {
			::details-content {
				height: 0;
				transition:
					height 100ms ease,
					content-visibility 100ms ease allow-discrete;
				overflow: clip;
			}

			details[open]::details-content {
				height: auto;
			}
		}
	}
</style>
