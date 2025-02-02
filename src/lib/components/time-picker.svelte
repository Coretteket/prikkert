<script lang="ts">
	import { PlainTime } from '@/lib/temporal'
	import TimePickerInput from './time-picker-input.svelte'

	type Props = { time: PlainTime | undefined; setTime?: (time: PlainTime) => void }

	let { time = $bindable(new PlainTime(0, 0)), setTime }: Props = $props()

	let minuteRef: HTMLInputElement | null = $state(null)
	let hourRef: HTMLInputElement | null = $state(null)

	function getAdjacentInput(target: HTMLInputElement | null, direction: 'next' | 'previous') {
		if (!target) return null

		const telInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="tel"]'))
		const currentIndex = telInputs.indexOf(target)

		if (currentIndex === -1) return null

		const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
		return nextIndex >= 0 && nextIndex < telInputs.length ? telInputs[nextIndex] : null
	}
</script>

<div class="flex items-center rounded border gap-0.5 px-1.5 py-0.5">
	<TimePickerInput
		picker="hours"
		bind:time
		bind:ref={hourRef}
		{setTime}
		onLeftFocus={() => getAdjacentInput(hourRef, 'previous')?.focus()}
		onRightFocus={() => getAdjacentInput(hourRef, 'next')?.focus()}
	/>

	<span>:</span>

	<TimePickerInput
		picker="minutes"
		bind:time
		bind:ref={minuteRef}
		{setTime}
		onLeftFocus={() => getAdjacentInput(minuteRef, 'previous')?.focus()}
		onRightFocus={() => getAdjacentInput(minuteRef, 'next')?.focus()}
	/>
</div>
