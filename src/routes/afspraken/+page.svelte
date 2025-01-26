<script lang="ts">
	import { enhance } from '$app/forms'

	let { data } = $props()
</script>

<div class="space-y-4">
	<p>Je bent ingelogd!</p>
	<ul class="list-inside list-disc">
		{#each data.events ?? [] as event}
			<li>
				<a href="/afspraak/{event.id}">
					{event.title}
				</a>
			</li>
		{/each}
	</ul>
	<form action="/uitloggen" method="post" use:enhance>
		<button type="submit" class="cursor-pointer">Uitloggen</button>
	</form>
</div>
