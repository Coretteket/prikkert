<script lang="ts">
	// import { formatDateTimeRange } from '@/lib/time-format'

	let { data } = $props()

	$inspect(data.sessions)
</script>

<div class="space-y-4">
	<ul class="list-inside list-disc space-y-2">
		{#each data.sessions ?? [] as session}
			<li>
				<a href="/afspraak/invullen/{session.event.id}" class="text-lg font-bold">
					{session.event.title}
				</a>
				<span>{session.id === session.event.organizer.sessionId ? 'Eigenaar' : 'Deelnemer'}</span>
				<!-- <ul class="ml-4 list-inside list-disc">
					{#each event.options as option}
						<li>
							{formatDateTimeRange(option)}
						</li>
					{/each}
				</ul> -->
			</li>
		{:else}
			<li>Geen afspraken gevonden</li>
		{/each}
	</ul>
</div>
