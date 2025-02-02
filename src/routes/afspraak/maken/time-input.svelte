<script lang="ts">
	import { PlainTime } from '@/lib/temporal'

	let { time = $bindable() }: { time?: PlainTime } = $props()
</script>

<input
	type="time"
	class="w-16 rounded border px-1 py-0.5 text-center tabular-nums [&::-webkit-calendar-picker-indicator]:hidden"
	bind:value={
		() => time?.toString().slice(0, 5) ?? '00:00',
		(value) => (time = PlainTime.from(value ?? '00:00'))
	}
/>
