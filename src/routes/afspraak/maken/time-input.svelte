<script lang="ts">
	type Props = {
		value: string
		type: 'hour' | 'minute'
	}

	let { value = $bindable(''), type }: Props = $props()

	let invalid = $derived(
		value.length > 0 &&
			(type == 'hour' ? value.padStart(2, '0') > '23' : value.padStart(2, '0') > '59'),
	)

	// function getNextInput(target: HTMLInputElement) {
	// 	const telInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="tel"]'))

	// 	const currentIndex = telInputs.indexOf(target)

	// 	return currentIndex > -1 && currentIndex < telInputs.length - 1
	// 		? telInputs[currentIndex + 1]
	// 		: null
	// }

	// function handleKeyDown(e: KeyboardEvent) {
	// 	if (e.key === 'Tab') return

	// 	e.preventDefault()

	// 	if (e.key >= '0' && e.key <= '9') {
	// 		const currentInput = e.currentTarget as HTMLInputElement

	// 		if (value.length !== 1) {
	// 			currentInput.value = e.key.padStart(2, '0')
	// 			value = e.key
	// 		} else {
	// 			currentInput.value = value + e.key
	// 			value += e.key
	// 			getNextInput(currentInput)?.focus()
	// 		}
	// 	}
	// }
</script>

<!-- onkeydown={handleKeyDown} -->
<!-- tabindex={type === 'hour' ? undefined : -1} -->
<input
	type="tel"
	placeholder="00"
	class={['w-6 outline-none', type === 'hour' ? 'text-right' : 'text-left']}
	aria-invalid={invalid ? true : undefined}
	bind:value={value}
/>
