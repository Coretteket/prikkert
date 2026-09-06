<script lang="ts">
	import { fade } from 'svelte/transition'

	import { beforeNavigate, afterNavigate } from '$app/navigation'

	const SHOW_DELAY = 150
	const HIDE_DELAY = 300
	const FADE_DURATION = 100
	const PROGRESS_MAX = 95
	const PROGRESS_SPEED = 0.03

	let progress = $state(0)
	let isVisible = $state(false)
	let isAnimating = $state(false)
	let frame: number | undefined
	let showTimeout: ReturnType<typeof setTimeout> | undefined
	let hideTimeout: ReturnType<typeof setTimeout> | undefined

	function animate() {
		// Exponential approach to max - slows down as it gets closer
		progress += (PROGRESS_MAX - progress) * PROGRESS_SPEED
		if (isAnimating && progress < PROGRESS_MAX) {
			frame = requestAnimationFrame(animate)
		}
	}

	beforeNavigate((navigation) => {
		if (navigation.willUnload) return

		// Start loading
		clearTimeout(hideTimeout)
		clearTimeout(showTimeout)
		cancelAnimationFrame(frame!)

		// Reset instantly (no transition)
		isAnimating = false
		progress = 0

		// Only show after delay to skip quick navigations
		showTimeout = setTimeout(() => {
			isVisible = true
			isAnimating = true
			frame = requestAnimationFrame(animate)
		}, SHOW_DELAY)
	})

	afterNavigate(() => {
		if (isVisible) {
			// Complete with animation, then hide
			cancelAnimationFrame(frame!)
			isAnimating = true
			progress = 100
			hideTimeout = setTimeout(() => {
				isVisible = false
			}, HIDE_DELAY)
		} else {
			// Navigation completed before bar was shown
			clearTimeout(showTimeout)
		}
	})
</script>

{#if isVisible}
	<output
		class="fixed top-0 right-0 left-0 z-50 h-0.75 overflow-hidden duration-200"
		out:fade={{ duration: FADE_DURATION }}
		role="progressbar"
		aria-valuenow={Math.round(progress)}
		aria-valuemin={0}
		aria-valuemax={100}
	>
		<div
			class="h-full rounded-r-full bg-pink-600 transition-[width] duration-200"
			style:width="{progress}%"
		></div>
	</output>
{/if}
