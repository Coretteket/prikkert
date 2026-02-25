<script lang="ts">
	import '@fontsource-variable/golos-text'
	import '../app.css'

	import { page } from '$app/state'

	import Loading from '@/components/loading.svelte'
	import Button from '@/components/button.svelte'
	import { setTheme } from '@/shared/theme'
	import Icon from '@/components/icon.svelte'
	import icon from '@/assets/icon.svg'
	import og from '@/assets/og.png'

	import Background from './background.svelte'
	import { hasSession } from './data.remote'
	import { description, getPageTitle } from '@/shared/seo/meta'
	import { generateJSONLD } from '@/shared/seo/json'
	import { getLocaleURL, setLocale, url } from '@/shared/url'
	import { createPopover } from '@/shared/popover.svelte'

	let { children } = $props()

	const popover = createPopover({ positionArea: 'bottom span-left' })
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={icon} />
	<title>{getPageTitle()}</title>
	<meta name="description" content={description} />
	<meta itemprop="name" content={getPageTitle()} />
	<meta itemprop="description" content={description} />
	<meta itemprop="image" content={og} />
	<meta property="og:url" content={'https://prikkert.nl' + page.url.pathname} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={getPageTitle()} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={og} />
	<meta property="og:site_name" content="Prikkert" />
	<meta property="og:locale" content="nl_NL" />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="canonical" href={`https://prikkert.nl${page.url.pathname}`} />
	<link rel="alternate" href={`https://prikkert.nl${getLocaleURL(page.url.pathname, 'en')}`} hreflang="en" />
	<link rel="alternate" href={`https://prikkert.nl${getLocaleURL(page.url.pathname, 'nl')}`} hreflang="nl" />
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

			<Button
				size="icon"
				label="Instellingen"
				{@attach popover.triggerHandler}
				{...popover.triggerAttrs}
			>
				<Icon icon="tabler--settings" class="size-5" />
			</Button>

			<div
				{@attach popover.floatingHandler}
				{...popover.floatingAttrs}
				class="grid min-w-40 gap-1 rounded-lg border bg-white px-1.5 py-2 text-neutral-700 ring-4 ring-white dark:bg-neutral-850 dark:text-neutral-300 dark:ring-neutral-850"
			>
				<Button
					lang={page.data.locale === 'en' ? 'nl' : undefined}
					variant="ghost"
					size="sm"
					class="w-full!"
					{@attach popover.closeHandler}
					{...popover.closeAttrs}
					onclick={() => setLocale('nl')}
				>
					<Icon icon="tabler--cheese" class="size-5" />
					<span>Nederlands</span>
				</Button>
				<Button
					lang={page.data.locale === 'nl' ? 'en' : undefined}
					variant="ghost"
					size="sm"
					class="w-full!"
					{@attach popover.closeHandler}
					{...popover.closeAttrs}
					onclick={() => setLocale('en')}
				>
					<Icon icon="tabler--teapot" class="size-5" />
					<span>English</span>
				</Button>
				<hr class="mx-2 my-1" />
				<Button
					variant="ghost"
					size="sm"
					class="w-full!"
					{@attach popover.closeHandler}
					{...popover.closeAttrs}
					onclick={() => setTheme('light')}
				>
					<Icon icon="tabler--sun" class="size-5" />
					<span>Licht thema</span>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					class="w-full!"
					{@attach popover.closeHandler}
					{...popover.closeAttrs}
					onclick={() => setTheme('dark')}
				>
					<Icon icon="tabler--moon" class="size-5" />
					<span>Donker thema</span>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					class="w-full!"
					{@attach popover.closeHandler}
					{...popover.closeAttrs}
					onclick={() => setTheme('system')}
				>
					<Icon icon="tabler--device-desktop" class="size-5" />
					<span>Systeemthema</span>
				</Button>
			</div>
		</div>
	</nav>

	<main class="p-6 pt-12">
		{@render children()}
	</main>

	<footer
		class="mx-6 mt-12 flex justify-between gap-x-8 gap-y-4 border-t py-8 text-[15px] max-sm:flex-col"
	>
		<a
			href={url('/')}
			class="inline-flex w-fit items-center gap-2 text-base font-medium text-neutral-700/80 hover:underline dark:text-neutral-300/80"
		>
			<img src={icon} width={16} height={16} alt="" class="opacity-50 brightness-0 dark:invert" />
			<span>Prikkert</span>
		</a>

		<div
			class="flex flex-wrap gap-x-8 gap-y-3 text-neutral-500 max-xs:flex-col sm:justify-end dark:text-neutral-400"
		>
			<a href={url('/privacy')} class="hover:underline">Privacy</a>
			<a href={url('/voorwaarden')} class="hover:underline">Voorwaarden</a>
			<a href="https://codeberg.org/qcoret/prikkert" class="hover:underline" target="_blank">
				Open source
			</a>
		</div>
	</footer>
</div>
