<script lang="ts">
	import '@fontsource-variable/parkinsans'
	import '@fontsource-variable/roboto-flex'
	import '../app.css'

	import icon from '@/lib/assets/icon.svg'
	import Button from '@/lib/components/button.svelte'

	let {data, children } = $props()
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={icon} />
	<title>Prikkert</title>
</svelte:head>

<div
	class="bg-white p-2 sm:mx-auto sm:my-8 sm:max-w-[min(42rem,_calc(100vw_-_2rem))] sm:rounded-lg sm:border sm:border-gray-300 sm:p-4"
>
	<nav class="flex items-center justify-between px-4 py-2">
		<a href="/" class="font-display flex items-center gap-3 text-xl text-gray-800">
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

<div class="fixed top-0 left-0 -z-50 bg-gray-300 max-sm:hidden">
	<div class="sticky top-0 left-0 h-screen w-screen overflow-hidden">
		<div class="absolute inset-0 -z-1 bg-white/20"></div>
		<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
			<defs>
				<pattern id="dotted-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
					<circle cx="2" cy="2" r="1" fill="black" />
				</pattern>
				<mask id="dots-mask">
					<rect width="100%" height="100%" fill="white" />
					<rect width="100%" height="100%" fill="url(#dotted-pattern)" />
				</mask>
			</defs>
			<rect width="100%" height="100%" fill="white" mask="url(#dots-mask)" />
		</svg>
	</div>
</div>
