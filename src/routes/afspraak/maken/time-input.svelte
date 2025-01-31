<script lang="ts">
	type Props = {
		ref?: HTMLInputElement
		type: 'hour' | 'minute'
		onLeftFocus?: () => void
		onRightFocus?: () => void
	}

	let { ref = $bindable(), type }: Props = $props()

	let value = $state('')

	let limitDigit = $derived(type === 'hour' ? '2' : '5')

	let invalid = $derived(
		value.length > 0 &&
			(type == 'hour' ? value.padStart(2, '0') > '23' : value.padStart(2, '0') > '59'),
	)

	function getNextInput(target: HTMLInputElement) {
		// Get all telephone inputs in the document
		const telInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="tel"]'))

		// Find the index of the current input
		const currentIndex = telInputs.indexOf(target)

		// Return the next tel input, or null if no more exist
		return currentIndex > -1 && currentIndex < telInputs.length - 1
			? telInputs[currentIndex + 1]
			: null
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Tab') return

		e.preventDefault()

		if (e.key >= '0' && e.key <= '9') {
			const currentInput = e.currentTarget as HTMLInputElement

			if (value.length !== 1 || value > limitDigit) {
				currentInput.value = e.key.padStart(2, '0')
				value = e.key
				if (value > limitDigit) getNextInput(currentInput)?.focus()
			} else {
				currentInput.value = value + e.key
				value += e.key
				getNextInput(currentInput)?.focus()
			}
		}
	}
</script>

<input
	bind:this={ref}
	onkeydown={handleKeyDown}
	type="tel"
	placeholder="00"
	class="w-10 border px-2 py-1 text-center aria-invalid:border-red-600"
	aria-invalid={invalid ? true : undefined}
/>
