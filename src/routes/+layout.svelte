<script lang="ts">
	import '@fontsource-variable/parkinsans'
	import '@fontsource-variable/lexend'
	import '../app.css'

	import icon from '@/lib/assets/icon.svg'
	import pattern from '@/lib/assets/pattern.svg'
	import Button from '@/lib/components/button.svelte'

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
	class="bg-white p-2 sm:mx-auto sm:my-8 sm:max-w-[min(42rem,_calc(100vw_-_2rem))] sm:rounded-lg sm:border sm:p-4 dark:bg-zinc-900 dark:sm:border-zinc-800"
>
	<nav class="flex items-center justify-between px-4 py-2">
		<a
			href="/"
			class="font-display flex items-center gap-3 text-xl text-zinc-800 dark:text-zinc-300"
		>
			<img src={icon} width={32} height={32} alt="" />
			Prikkert
		</a>

		{#if data.hasSession}
			<Button as="link" href="/afspraken">Jouw afspraken</Button>
		{:else}
			<Button as="link" href="/afspraak/maken">Afspraak maken</Button>
		{/if}
	</nav>
	<main class="p-4 pt-8">
		{@render children()}
	</main>
</div>
