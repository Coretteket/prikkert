<script lang="ts">
	import { PlainTime } from '@/lib/temporal'
	import TimeInput from './time-input.svelte'

	type Props = { range: { startsAt?: PlainTime; endsAt?: PlainTime } }
	type RangeKey = keyof Props['range']
	type Type = 'hour' | 'minute'

	let { range = $bindable() }: Props = $props()
</script>

<div class="flex items-center gap-3">
	{@render time('startsAt')}
	&mdash;
	{@render time('endsAt')}
</div>

{#snippet time(key: RangeKey)}
	<div class="rounded border px-2 py-1">
		{@render timePart(key, 'hour')}
		:
		{@render timePart(key, 'minute')}
	</div>
{/snippet}

{#snippet timePart(key: RangeKey, type: Type)}
	<TimeInput
		{type}
		bind:value={
			() => range[key]?.[type].toString().padStart(2, '0') ?? '',
			(val) => {
				range[key] = range[key]?.with({ [type]: +val }) ?? PlainTime.from({ [type]: +val })
			}
		}
	/>
{/snippet}
