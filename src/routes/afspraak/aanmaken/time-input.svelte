<script lang="ts">
	import { Temporal } from '@/shared/temporal'

	let { time = $bindable() }: { time?: Temporal.PlainTime } = $props()
</script>

<input
	type="time"
	class="w-fit min-w-20 appearance-none rounded-md border px-2.5 py-1.5 text-center text-neutral-700 tabular-nums dark:bg-neutral-800/50 dark:text-neutral-300"
	bind:value={
		() => time?.toString().slice(0, 5),
		(value) => (time = value && value !== '' ? Temporal.PlainTime.from(value) : undefined)
	}
/>
