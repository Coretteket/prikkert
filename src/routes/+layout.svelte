<script lang="ts">
	import '../app.css'

	let { data, children } = $props()
</script>

<div class="mx-auto max-w-2xl p-4">
	<nav class="flex items-center justify-between p-4">
		<a href="/">Prikkert</a>
		{#if data.session}
			<a href="/afspraken">Jouw afspraken</a>
		{:else}
			<a href="/inloggen">Aanmelden</a>
		{/if}
	</nav>
	<main class="p-4">
		{@render children()}
	</main>
</div>
