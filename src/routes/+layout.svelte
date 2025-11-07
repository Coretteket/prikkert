<script lang="ts">
	import '@fontsource-variable/parkinsans'
	import '@fontsource-variable/lexend'
	import '../app.css'

	import icon from '@/lib/assets/icon.svg'
	import pattern from '@/lib/assets/pattern.svg'
	import Button from '@/lib/components/button.svelte'
	import { IconMoon, IconSun } from '@tabler/icons-svelte'
	import { toggleTheme } from '@/lib/theme'

	let { data, children } = $props()
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={icon} />
	<title>Prikkert</title>
</svelte:head>

<div
	class="fixed inset-0 -z-50 opacity-5 max-sm:hidden dark:invert"
	style={`background: url("${pattern}"); background-size: 100px;`}
></div>

<div
	class="bg-white p-2 sm:mx-auto sm:my-8 sm:max-w-[min(48rem,_calc(100vw_-_3rem))] sm:rounded-lg sm:border sm:p-4 dark:bg-zinc-900 dark:sm:border-zinc-800"
>
	<nav class="flex items-center justify-between px-4 py-2">
		<a
			href="/"
			class="font-display flex items-center gap-3 text-xl font-[450] text-zinc-800 sm:text-2xl dark:text-zinc-300"
		>
			<img src={icon} width={36} height={36} alt="" class="max-xs:size-10" />
			<span class="max-xs:hidden">Prikkert</span>
		</a>

		<div class="flex gap-3">
			<Button size="icon" onclick={() => toggleTheme()}>
				<IconSun class="not-dark:hidden" />
				<IconMoon class="dark:hidden" />
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
