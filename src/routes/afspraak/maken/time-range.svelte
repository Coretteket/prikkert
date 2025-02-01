<script lang="ts">
	import { PlainTime } from '@/lib/temporal'
	import TimeInput from './time-input.svelte'

	type Props = { range: { startsAt?: PlainTime; endsAt?: PlainTime } }
	let { range = $bindable() }: Props = $props()
</script>

<div class="flex items-center gap-3">
	<div class="rounded border px-2 py-1">
		<TimeInput
			type="hour"
			bind:value={
				() => range.startsAt?.hour.toString().padStart(2, '0') ?? '',
				(hour) =>
					(range.startsAt =
						range.startsAt?.with({ hour: +hour }) ?? PlainTime.from({ hour: +hour }))
			}
		/>
		:
		<TimeInput
			type="minute"
			bind:value={
				() => range.startsAt?.minute.toString().padStart(2, '0') ?? '',
				(minute) =>
					(range.startsAt =
						range.startsAt?.with({ minute: +minute }) ?? PlainTime.from({ minute: +minute }))
			}
		/>
	</div>
	&mdash;
	<div class="rounded border px-2 py-1">
		<TimeInput
			type="hour"
			bind:value={
				() => range.endsAt?.hour.toString().padStart(2, '0') ?? '',
				(hour) =>
					(range.endsAt = range.endsAt?.with({ hour: +hour }) ?? PlainTime.from({ hour: +hour }))
			}
		/>
		:
		<TimeInput
			type="minute"
			bind:value={
				() => range.endsAt?.minute.toString().padStart(2, '0') ?? '',
				(minute) =>
					(range.endsAt =
						range.endsAt?.with({ minute: +minute }) ?? PlainTime.from({ minute: +minute }))
			}
		/>
	</div>
</div>
