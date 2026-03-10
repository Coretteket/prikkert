<script lang="ts">
	import '@fontsource-variable/golos-text'
	import '../app.css'

	import { env } from '$env/dynamic/public'

	import { page } from '$app/state'

	import Loading from '@/components/loading.svelte'
	import Button from '@/components/button.svelte'
	import Icon from '@/components/icon.svelte'
	import Settings from '@/components/settings.svelte'
	import icon from '@/assets/icon.svg'
	import og from '@/assets/og.png'

	import Background from './background.svelte'
	import Footer from './footer.svelte'
	import { hasSession } from './data.remote'
	import { getPageMeta } from '@/shared/seo/meta'
	import { generateJSONLD } from '@/shared/seo/json'
	import { getLocaleURL, url } from '@/shared/url'
	import { setLocale } from '@/client/cookies'

	let { children } = $props()

	const meta = $derived(getPageMeta())
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={icon} />
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<meta itemprop="name" content={meta.title} />
	<meta itemprop="description" content={meta.description} />
	<meta itemprop="image" content={og} />
	<meta property="og:url" content={env.PUBLIC_ORIGIN + page.url.pathname} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:image" content={og} />
	<meta property="og:site_name" content="Prikkert" />
	<meta property="og:locale" content={page.data.locale} />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="canonical" href={`${env.PUBLIC_ORIGIN}${page.url.pathname}`} />
	<link
		rel="alternate"
		href={`${env.PUBLIC_ORIGIN}${getLocaleURL(page.url.pathname, 'en')}`}
		hreflang="en"
	/>
	<link
		rel="alternate"
		href={`${env.PUBLIC_ORIGIN}${getLocaleURL(page.url.pathname, 'nl')}`}
		hreflang="nl"
	/>
	{@html `<script type="application/ld+json">${generateJSONLD()}</script>`}
</svelte:head>

<Loading />
<Background />

<div
	class="bg-white ring-6 ring-white lg:mx-auto lg:my-8 lg:max-w-4xl lg:rounded-lg lg:border lg:p-4 lg:pb-2 dark:bg-neutral-850 dark:ring-neutral-850"
>
	<nav class="flex items-center justify-between px-6 py-4">
		<a
			href={url('/')}
			class="flex items-center gap-3 squircle text-xl font-[520] text-neutral-900 sm:text-[1.4rem] dark:text-neutral-100"
		>
			<img src={icon} width={36} height={36} alt="" />
			<span>Prikkert</span>
		</a>

		<div class="flex gap-3">
			{#if await hasSession()}
				<Button class="max-xs:hidden" as="link" href={url('/afspraken')}>Jouw afspraken</Button>
				<Button
					class="xs:hidden"
					size="icon"
					label="Jouw afspraken"
					as="link"
					href={url('/afspraken')}
				>
					<Icon icon="tabler--calendar-user" class="size-5" />
				</Button>
			{:else}
				<Button class="max-xs:hidden" as="link" href={url('/afspraak/aanmaken')}>
					Afspraak aanmaken
				</Button>
				<Button
					class="xs:hidden"
					size="icon"
					label="Afspraak aanmaken"
					as="link"
					href={url('/afspraak/aanmaken')}
				>
					<Icon icon="tabler--calendar-plus" class="size-5" />
				</Button>
			{/if}

			<Settings />
		</div>
	</nav>

	<main class="p-6 pt-12">
		{@render children()}
	</main>

	<Footer />
</div>
