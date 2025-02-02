<script lang="ts">
	import {
		useFloating,
		flip,
		autoUpdate,
		offset,
		useInteractions,
		useClick,
		useRole,
		useDismiss,
		useId,
	} from '@skeletonlabs/floating-ui-svelte'
	import { state } from '@/state.svelte'
	import { IconDotsVertical } from '@tabler/icons-svelte'
	import type { Snippet } from 'svelte'

	type Props = { children: Snippet<[typeof close]> }
	let { children }: Props = $props()

	let id = useId()

	function close() {
		state.activePopover = null
	}

	const floating = useFloating({
		placement: 'bottom-end',
		middleware: [offset({ crossAxis: -4, mainAxis: 16 }), flip()],
		whileElementsMounted: autoUpdate,
		onOpenChange: (v) => (state.activePopover = v ? id : null),
		get open() {
			return state.activePopover === id
		},
	})

	const role = useRole(floating.context, { role: 'menu' })
	const click = useClick(floating.context)
	const dismiss = useDismiss(floating.context)
	const interactions = useInteractions([role, click, dismiss])
</script>

<button
	type="button"
	bind:this={floating.elements.reference}
	class="cursor-pointer text-stone-600"
	{...interactions.getReferenceProps()}
>
	<IconDotsVertical size={20} />
</button>

<div
	bind:this={floating.elements.floating}
	class={['absolute top-0 left-0 w-max']}
	style={floating.floatingStyles}
	{...interactions.getFloatingProps()}
>
	{#if floating.open}
		{@render children(close)}
	{/if}
</div>
