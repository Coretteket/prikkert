<script lang="ts">
	import type { Snippet } from 'svelte'

	import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'

	import Icon from '@/components/icon.svelte'
	import { store } from '@/state.svelte'

	let { children }: { children: Snippet } = $props()

	const id = crypto.randomUUID()
	let referenceEl: HTMLElement | undefined
	let floatingEl: HTMLElement | undefined

	let isOpen = $derived(store.activePopover === id)

	function trigger(node: HTMLElement) {
		referenceEl = node

		function handleClick() {
			store.activePopover = isOpen ? undefined : id
		}

		node.addEventListener('click', handleClick)

		return () => {
			node.removeEventListener('click', handleClick)
			referenceEl = undefined
		}
	}

	function popup(node: HTMLElement) {
		floatingEl = node

		const cleanup = autoUpdate(referenceEl!, floatingEl, async () => {
			if (!referenceEl || !floatingEl) return

			const { x, y } = await computePosition(referenceEl, floatingEl, {
				placement: 'bottom-end',
				middleware: [offset({ crossAxis: 4 }), shift(), flip()],
			})

			Object.assign(floatingEl.style, {
				left: `${x}px`,
				top: `${y}px`,
				position: 'absolute',
			})
		})

		return () => {
			cleanup()
			floatingEl = undefined
		}
	}

	$effect(() => {
		if (!isOpen) return

		function handleOutsideClick(event: MouseEvent) {
			if (
				referenceEl &&
				!referenceEl.contains(event.target as Node) &&
				floatingEl &&
				!floatingEl.contains(event.target as Node)
			) {
				store.activePopover = undefined
			}
		}

		document.addEventListener('click', handleOutsideClick)
		return () => document.removeEventListener('click', handleOutsideClick)
	})
</script>

<button
	type="button"
	{@attach trigger}
	class="cursor-pointer text-neutral-600 dark:text-neutral-400"
	aria-haspopup="menu"
	aria-expanded={isOpen}
	aria-controls={isOpen ? id : undefined}
>
	<Icon icon="tabler--dots-vertical" class="size-5" />
</button>

{#if isOpen}
	<div {id} role="menu" tabindex="-1" {@attach popup} class="absolute top-0 left-0 z-100 w-max p-2">
		{@render children()}
	</div>
{/if}
