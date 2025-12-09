<script lang="ts">
	import { fade } from 'svelte/transition'

	import { beforeNavigate, afterNavigate } from '$app/navigation'

	const SHOW_DELAY = 150
	const HIDE_DELAY = 300
	const FADE_DURATION = 100
	const PROGRESS_MAX = 95
	const PROGRESS_SPEED = 0.03

	let progress = $state(0)
	let visible = $state(false)
	let animating = $state(false)
	let frame: number | undefined
	let showTimeout: ReturnType<typeof setTimeout> | undefined
	let hideTimeout: ReturnType<typeof setTimeout> | undefined

	function animate() {
		// Exponential approach to max - slows down as it gets closer
		progress += (PROGRESS_MAX - progress) * PROGRESS_SPEED
		if (animating && progress < PROGRESS_MAX) {
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
		animating = false
		progress = 0

		// Only show after delay to skip quick navigations
		showTimeout = setTimeout(() => {
			visible = true
			animating = true
			frame = requestAnimationFrame(animate)
		}, SHOW_DELAY)
	})

	afterNavigate(() => {
		if (visible) {
			// Complete with animation, then hide
			cancelAnimationFrame(frame!)
			animating = true
			progress = 100
			hideTimeout = setTimeout(() => {
				visible = false
			}, HIDE_DELAY)
		} else {
			// Navigation completed before bar was shown
			clearTimeout(showTimeout)
		}
	})
</script>

{#if visible}
	<output
		class="fixed top-0 left-0 right-0 z-50 h-[3px] overflow-hidden duration-200"
		out:fade={{ duration: FADE_DURATION }}
		role="progressbar"
		aria-valuenow={Math.round(progress)}
		aria-valuemin={0}
		aria-valuemax={100}
	>
		<div
			class="h-full bg-pink-600 transition-[width] duration-200 rounded-r-full"
			style:width="{progress}%"
		></div>
	</output>
{/if}
