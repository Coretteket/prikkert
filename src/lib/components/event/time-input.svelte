<script lang="ts">
	import { Temporal } from '@/shared/temporal'
	import { KeyType } from '@/shared/utils'

	let { time = $bindable() }: { time?: Temporal.PlainTime } = $props()

	let displayValue = $derived(time?.toString({ smallestUnit: 'minute' }) ?? '')

	function parseTime(input: string) {
		const clean = input.replaceAll(/[^0-9]/g, '')
		if (clean.length > 4 || clean.length === 0) return

		let hour = clean.length >= 3 ? Number.parseInt(clean.slice(0, -2)) : Number.parseInt(clean)
		let minute = clean.length >= 3 ? Number.parseInt(clean.slice(-2)) : 0
		return Temporal.PlainTime.from({ hour, minute })
	}

	function handleBlur(event: FocusEvent & { currentTarget: HTMLInputElement }) {
		const input = event.currentTarget
		if (!input.value) return (time = undefined)

		time = parseTime(input.value)
		input.value = time ? time.toString({ smallestUnit: 'minute' }) : displayValue
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		if (event.key === KeyType.Enter) return event.currentTarget.blur()
		if (event.key.length > 1 || event.ctrlKey || event.metaKey || event.altKey) return

		const value = event.currentTarget.value
		const max = value.includes(':') || value.includes('.') ? 5 : 4
		if (value.length >= max || !/^[0-9.:]$/.test(event.key)) event.preventDefault()
	}
</script>

<input
	type="text"
	inputmode="numeric"
	class="w-20 rounded-md border px-2.5 py-2 text-center tabular-nums dark:bg-neutral-825 dark:text-neutral-300"
	value={displayValue}
	onblur={handleBlur}
	onkeydown={handleKeydown}
	placeholder="00:00"
/>
