<script lang="ts">
	import '@fontsource-variable/parkinsans'
	import '@fontsource-variable/lexend'
	import '../app.css'

	import icon from '@/lib/assets/icon.svg'
	import pattern from '@/lib/assets/pattern.svg'
	import Button from '@/lib/components/button.svelte'
	import Icon from '@/lib/components/icon.svelte'
	import { toggleTheme } from '@/lib/theme'

	let { data, children } = $props()
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
			href="/"
			class="font-display flex items-center gap-3 text-xl font-medium text-neutral-800 dark:text-neutral-300"
		>
			<img src={icon} width={36} height={36} alt="" />
			<span class="max-[440px]:hidden">Prikkert</span>
		</a>

		<div class="flex gap-3">
			<Button size="icon" onclick={() => toggleTheme()}>
				<Icon icon="tabler--sun" class="size-5 not-dark:hidden" />
				<Icon icon="tabler--moon" class="size-5 dark:hidden" />
			</Button>
			{#if data.hasSession}
				<Button as="link" href="/afspraken">Jouw afspraken</Button>
			{:else}
				<Button as="link" href="/afspraak/aanmaken">Afspraak aanmaken</Button>
			{/if}
		</div>
	</nav>
	<main class="p-4 pt-8">
		{@render children()}
	</main>
</div>
