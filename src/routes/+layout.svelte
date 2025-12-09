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
	class="dark:bg-neutral-850 bg-white lg:mx-auto lg:my-8 lg:max-w-4xl lg:rounded-lg lg:border lg:p-4 ring-6 ring-white dark:ring-neutral-850"
>
	<nav class="flex items-center justify-between px-6 py-4">
		<a
			href={resolve('/')}
			class="font-display squircle flex items-center gap-3 font-[450] text-[1.4rem] text-neutral-900 dark:text-neutral-100"
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
</div>
