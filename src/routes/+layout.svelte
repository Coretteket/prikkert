<script lang="ts">
	import '@fontsource-variable/parkinsans'
	import '@fontsource-variable/lexend'
	import '../app.css'

	import icon from '@/lib/assets/icon.svg'
	import pattern from '@/lib/assets/pattern.svg'
	import Button from '@/lib/components/button.svelte'
	import { IconMoon, IconSun } from '@tabler/icons-svelte'
	import { toggleTheme } from '@/lib/theme'
	import { Now } from '@/lib/temporal'

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
			class="font-display flex items-center gap-3 text-2xl text-zinc-800 dark:text-zinc-300"
		>
			<img src={icon} width={32} height={32} alt="" />
			Prikkert
		</a>

		<div class="flex gap-4">
			<button onclick={() => toggleTheme()} class="opacity-75">
				<IconSun class="not-dark:hidden" />
				<IconMoon class="dark:hidden" />
			</button>
			{#if data.hasSession}
				<Button as="link" href="/afspraken">Jouw afspraken</Button>
			{:else}
				<Button as="link" href="/afspraak/maken">Afspraak maken</Button>
			{/if}
		</div>
	</nav>
	<main class="p-4 pt-8">
		{@render children()}
	</main>
	<footer class="p-4 dark:text-zinc-600 text-zinc-400 text-sm pt-12 text-center text-balance">
		Prikkert &copy; {Now.plainDateISO().year} &mdash; gelicenseerd krachtens de
		<a href="https://github.com/coretteket/prikkert/?tab=EUPL-1.2-1-ov-file#readme" target="_blank" class="hover:underline">EUPL</a>
	</footer>
</div>
