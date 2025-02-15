<script lang="ts">
	import '@fontsource-variable/parkinsans'
	import '@fontsource-variable/lexend'
	import '../app.css'

	import icon from '@/lib/assets/icon.svg'
	import pattern from '@/lib/assets/pattern.svg'
	import Button from '@/lib/components/button.svelte'
	import { IconMoon, IconSun } from '@tabler/icons-svelte'
	import { browser } from '$app/environment'

	let { data, children } = $props()

	function parseCookie(key: string) {
		if (!browser) return 'light'
		const cookie = document.cookie.split('; ').find((row) => row.startsWith(`${key}=`))
		return cookie ? cookie.split('=')[1] : 'light'
	}

	let theme = $state(parseCookie('theme') === 'light' ? 'light' : 'dark')

	$effect(() => {
		if (!browser) return
		document.documentElement.classList.add('no-transition')
		const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
		document.cookie = `theme=${theme === systemTheme ? 'system' : theme}; path=/; max-age=31536000`
		document.documentElement.dataset.theme = theme
		document.documentElement.offsetHeight
		document.documentElement.classList.remove('no-transition')
	})
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
			<button onclick={() => (theme = theme === 'dark' ? 'light' : 'dark')} class="opacity-75">
				{#if theme === 'dark'}
					<IconSun />
				{:else}
					<IconMoon />
				{/if}
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
</div>
