<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'
	import { PlainTime } from '@/lib/temporal'

	import {
		type TimePickerType,
		getArrowByType,
		getDateByType,
		setDateByType,
	} from './time-picker-utils'

	export type TimePickerInputProps = HTMLInputAttributes & {
		ref?: HTMLInputElement | null
		type?: string
		value?: string
		name?: string
		picker: TimePickerType
		time: PlainTime | undefined
		setTime?: (time: PlainTime) => void
		onRightFocus?: () => void
		onLeftFocus?: () => void
	}
	let {
		class: className,
		type = 'tel',
		value,
		id,
		name,
		time = $bindable(new PlainTime(0, 0)),
		setTime,
		picker,
		onLeftFocus,
		onRightFocus,
		onkeydown,
		onchange,
		ref = $bindable(null),
		...restProps
	}: TimePickerInputProps = $props()

	let flag = $state<boolean>(false)

	let calculatedValue = $derived(getDateByType(time, picker))

	$effect(() => {
		if (flag) {
			const timer = setTimeout(() => {
				flag = false
			}, 2000)

			return () => clearTimeout(timer)
		}
	})

	function calculateNewValue(key: string) {
		return !flag ? '0' + key : calculatedValue.slice(1, 2) + key
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Tab') return

		e.preventDefault()

		if (e.key === 'ArrowRight') onRightFocus?.()
		if (e.key === 'ArrowLeft') onLeftFocus?.()

		if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
			const step = e.key === 'ArrowUp' ? 1 : -1
			const newValue = getArrowByType(calculatedValue, step, picker)

			if (flag) flag = false

			time = setDateByType(time, newValue, picker)
			setTime?.(time)
		}
		if (e.key >= '0' && e.key <= '9') {
			const newValue = calculateNewValue(e.key)
			if (flag) onRightFocus?.()
			flag = !flag

			time = setDateByType(time, newValue, picker)
			setTime?.(time)
		}
	}
</script>

<input
	bind:this={ref}
	id={id || picker}
	name={name || picker}
	class={[
		'w-6 text-center text-base tabular-nums caret-transparent [&::-webkit-inner-spin-button]:appearance-none',
		className,
	]}
	value={value || calculatedValue}
	onchange={(e) => {
		e.preventDefault()
		onchange?.(e)
	}}
	{type}
	inputmode="decimal"
	onkeydown={(e) => {
		onkeydown?.(e)
		handleKeyDown(e)
	}}
	{...restProps}
/>
