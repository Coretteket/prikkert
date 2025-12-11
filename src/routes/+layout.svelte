<script lang="ts">
	import '@fontsource-variable/parkinsans'
	import '@fontsource-variable/lexend'
	import '../app.css'

	import { resolve } from '$app/paths'

	import Loading from '@/components/loading.svelte'
	import Button from '@/components/button.svelte'
	import { toggleTheme } from '@/shared/theme'
	import Icon from '@/components/icon.svelte'
	import icon from '@/assets/icon.svg'

	import Background from './background.svelte'
	import { hasSession } from './data.remote'

	let { children } = $props()
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={icon} />
	<title>Prikkert</title>
</svelte:head>

<Loading />
<Background />

<div
	class="dark:bg-neutral-850 dark:ring-neutral-850 bg-white ring-6 ring-white lg:mx-auto lg:my-8 lg:max-w-4xl lg:rounded-lg lg:border lg:p-4 lg:pb-2"
>
	<nav class="flex items-center justify-between px-6 py-4">
		<a
			href={resolve('/')}
			class="font-display squircle flex items-center gap-3 text-[1.4rem] font-[450] text-neutral-900 dark:text-neutral-100"
		>
			<img src={icon} width={36} height={36} alt="" />
			<span>Prikkert</span>
		</a>

		<div class="flex gap-3">
			<Button size="icon" onclick={() => toggleTheme()}>
				<Icon icon="tabler--sun" class="size-5 not-dark:hidden" />
				<Icon icon="tabler--moon" class="size-5 dark:hidden" />
			</Button>
			{#if await hasSession()}
				<Button class="max-xs:hidden" as="link" href="/afspraken">Jouw afspraken</Button>
				<Button class="xs:hidden" size="icon" as="link" href="/afspraken">
					<Icon icon="tabler--calendar-user" class="size-5" />
				</Button>
			{:else}
				<Button class="max-xs:hidden" as="link" href="/afspraak/aanmaken">Afspraak aanmaken</Button>
				<Button class="xs:hidden" size="icon" as="link" href="/afspraak/aanmaken">
					<Icon icon="tabler--calendar-plus" class="size-5" />
				</Button>
			{/if}
		</div>
	</nav>

	<main class="p-6 pt-12">
		{@render children()}
	</main>

	<footer
		class="mx-6 mt-12 flex justify-between gap-x-8 gap-y-4 border-t py-8 text-[15px] max-sm:flex-col"
	>
		<a
			href="/"
			class="font-display inline-flex w-fit items-center gap-2 text-base font-medium text-neutral-700/80 hover:underline dark:text-neutral-300/80"
		>
			<img src={icon} width={16} height={16} alt="" class="opacity-50 brightness-0 dark:invert" />
			Prikkert
		</a>

		<div
			class="max-xs:flex-col flex flex-wrap gap-x-8 gap-y-3 text-neutral-600/80 sm:justify-end dark:text-neutral-400/80"
		>
			<a href="/privacy" class="hover:underline">Privacy</a>
			<a href="/voorwaarden" class="hover:underline">Voorwaarden</a>
			<a href="https://github.com/coretteket/prikkert" class="hover:underline" target="_blank">
				Open source
			</a>
		</div>
	</footer>
</div>
