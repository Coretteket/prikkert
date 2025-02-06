<script lang="ts">
	import { PlainTime } from '@/lib/temporal'

	let { time = $bindable(undefined) }: { time?: PlainTime } = $props()
</script>

<input
	type="time"
	class="w-17 appearance-none rounded border border-gray-300 px-1.5 py-0.5 text-center text-gray-900 tabular-nums"
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
</style>
