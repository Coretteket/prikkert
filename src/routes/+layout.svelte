<script lang="ts">
	import '@fontsource-variable/parkinsans'
	import '@fontsource-variable/lexend'
	import '../app.css'

	import { resolve } from '$app/paths'

	import { hasSession } from '@/remote/has-session.remote'
	import Button from '@/components/button.svelte'
	import Icon from '@/components/icon.svelte'
	import pattern from '@/assets/pattern.svg'
	import { toggleTheme } from '@/theme'
	import icon from '@/assets/icon.svg'

	let { children } = $props()
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={icon} />
	<title>Prikkert</title>
</svelte:head>

<div
	class="fixed inset-0 -z-50 opacity-4 max-sm:hidden dark:invert"
	style={`background: url("${pattern}"); background-size: 100px;`}
></div>

<div
	class="dark:bg-neutral-850 bg-white p-2 sm:mx-auto sm:my-8 sm:max-w-[min(48rem,calc(100vw-3rem))] sm:rounded-lg sm:border sm:p-4"
>
	<nav class="flex items-center justify-between px-4 py-2">
		<a
			href={resolve('/')}
			class="font-display squircle flex items-center gap-3 text-xl font-medium text-neutral-800 dark:text-neutral-300"
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
	<main class="p-4 pt-12">
		{@render children()}
	</main>
</div>
