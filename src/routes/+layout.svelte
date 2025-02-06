<script lang="ts">
	import fontHref from '@fontsource-variable/sofia-sans/files/sofia-sans-latin-wght-normal.woff2?url'
	import '@fontsource-variable/albert-sans'
	import '@fontsource-variable/parkinsans'
	import '../app.css'

	import icon from '@/lib/assets/icon.svg'
	import Button from '@/lib/components/button.svelte'

	let { data, children } = $props()
</script>

<svelte:head>
	<link rel="preload" as="font" type="font/woff2" href={fontHref} crossorigin="anonymous" />
	<link rel="icon" type="image/svg+xml" href={icon} />
	<title>Prikkert</title>
</svelte:head>

<div class="mx-auto my-8 max-w-2xl rounded-lg border border-gray-300 bg-white p-2 sm:p-4">
	<nav class="flex items-center justify-between p-4">
		<a href="/" class="font-display flex items-center gap-3 text-xl">
			<img src={icon} width={32} height={32} alt="" />
			Prikkert
		</a>
		<Button as="link" href={data.session ? '/afspraken' : '/inloggen'}>
			{#if data.session}
				Jouw afspraken
			{:else}
				Inloggen
			{/if}
		</Button>
	</nav>
	<main class="p-4">
		{@render children()}
	</main>
</div>

<div class="fixed top-0 left-0 -z-50 bg-gray-300">
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
