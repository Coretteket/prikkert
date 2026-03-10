<script lang="ts">
	import FaqItem from '@/components/faq-item.svelte'
	import Button from '@/components/button.svelte'
	import { getContent } from '@/shared/content'
	import Icon from '@/components/icon.svelte'
	import Step from '@/components/step.svelte'
	import { url } from '@/shared/url'

	const content = $derived(getContent())
</script>

<header class="mt-8 mb-24 space-y-4 sm:mt-10 sm:mb-28">
	<h1
		class="mb-8 text-center text-[2.2rem] leading-[1.2] font-[650] text-neutral-900 xs:text-[2.5rem] sm:text-5xl dark:text-neutral-100"
	>
		Samen plannen,<br />
		zo geprikt
	</h1>
	<h2
		class="mx-auto mb-8 max-w-80 text-center text-xl leading-normal text-balance text-neutral-700 sm:max-w-100 dark:text-neutral-300"
	>
		Vind
		<strong class="font-bold text-pink-600 dark:text-pink-50">gratis</strong>
		en
		<strong class="font-bold text-pink-600 dark:text-pink-50">reclamevrij</strong>
		het beste moment voor elke groepsafspraak.
	</h2>
	<Button as="link" href={url('/afspraak/aanmaken')} variant="primary" size="lg" class="mx-auto">
		Afspraak aanmaken
	</Button>
</header>

<section class="mb-24">
	<h2 class="mb-6 text-center text-xl font-semibold xs:text-2xl">Waarom Prikkert?</h2>
	<p
		class="mx-auto mb-12 max-w-100 text-center font-medium text-balance text-neutral-600 dark:text-neutral-300"
	>
		Datumprikken kan ook zonder verdienmodel. Daarom doet Prikkert vier beloftes.
	</p>
	<div class="mb-8 grid gap-4 sm:grid-cols-2">
		{#each content.promises as promise}
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
</section>

<section class="mb-24">
	<h2 class="mb-6 text-center text-xl font-semibold xs:text-2xl">Hoe gebruik je Prikkert?</h2>
	<p
		class="mx-auto mb-12 max-w-100 text-center font-medium text-balance text-neutral-600 dark:text-neutral-300"
	>
		Plan jouw groepsafspraak in drie simpele stappen.
	</p>
	<div class="mx-auto max-w-120">
		{#each content.steps as step, i}
			<Step n={i + 1} bold={step.bold} normal={step.normal} />
		{/each}
	</div>
	<Button as="link" href={url('/afspraak/aanmaken')} variant="primary" class="mx-auto mt-12">
		Begin met plannen
	</Button>
</section>

<section>
	<h2 class="mb-6 text-center text-xl font-semibold xs:text-2xl" id="faq">Hoe werkt Prikkert?</h2>
	<p
		class="mx-auto mb-12 max-w-100 text-center font-medium text-balance text-neutral-600 dark:text-neutral-300"
	>
		Vind de antwoorden op veelgestelde vragen.
	</p>
	<div class="mx-auto max-w-130">
		{#each content.faq as { question, answer }, i}
			<FaqItem {question} open={i === 0}>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html answer}
			</FaqItem>
		{/each}
	</div>

	<div class="mx-auto flex w-fit flex-wrap gap-4">
		<Button as="link" href={url('/afspraak/aanmaken')} variant="primary" class="mx-auto mt-12">
			Afspraak aanmaken
		</Button>
		<Button as="link" href={url('/contact')} variant="secondary" class="mx-auto mt-12">
			Contact opnemen
		</Button>
	</div>
</section>
