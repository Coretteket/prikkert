<script lang="ts">
	import { PlainTime } from '@/lib/temporal'

	let { time = $bindable(undefined) }: { time?: PlainTime } = $props()
</script>

<input
	type="time"
	class="w-fit appearance-none rounded-md border px-2.5 min-w-20 py-1.5 text-center text-neutral-700 tabular-nums dark:bg-neutral-800/50 dark:text-neutral-300"
	bind:value={
		() => time?.toString().slice(0, 5),
		(value) => (time = value && value !== '' ? PlainTime.from(value) : undefined)
	}
/>

<style>
	input[type='time']::-webkit-date-and-time-value {
		margin: 0;
		width: 100%;
	}

	input[type='time']::-webkit-calendar-picker-indicator {
		display: none;
		-webkit-appearance: none;
	}
</style>
