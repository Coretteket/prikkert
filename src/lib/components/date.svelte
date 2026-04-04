<script lang="ts">
	import type { Temporal } from 'temporal-polyfill'

	import { formatDate } from '@/shared/time-format'

	type Props = {
		startsAt: Temporal.ZonedDateTime | Temporal.PlainDate
		endsAt?: Temporal.ZonedDateTime | Temporal.PlainDate | null
		options?: { weekday?: boolean; time?: boolean }
		class?: string
	}

	let { startsAt, endsAt, options, class: className }: Props = $props()

	const formattedOption = $derived(formatDate(startsAt, endsAt ?? undefined))
</script>

<time datetime={startsAt.toString()} class={className}
	>{#if formattedOption.kind === 'single'}
		{#if options?.weekday !== false}{formattedOption.weekday}{/if}
		<span class="whitespace-nowrap">{formattedOption.date}</span
		>{#if options?.time !== false && formattedOption.time}, <span class="whitespace-nowrap"
				>{formattedOption.time}</span
			>{/if}
	{:else}
		{#if options?.weekday !== false}{formattedOption.start.weekday}{/if}
		<span class="whitespace-nowrap">{formattedOption.start.date}</span
		>{#if options?.time !== false && formattedOption.start.time}, <span class="whitespace-nowrap"
				>{formattedOption.start.time}</span
			>{/if} – {#if options?.weekday !== false}{formattedOption.end.weekday}{/if}
		<span class="whitespace-nowrap">{formattedOption.end.date}</span
		>{#if options?.time !== false && formattedOption.end.time}, <span class="whitespace-nowrap"
				>{formattedOption.end.time}</span
			>{/if}
	{/if}</time
>
