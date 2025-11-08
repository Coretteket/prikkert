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
		shift,
	} from '@skeletonlabs/floating-ui-svelte'
	import { store } from '@/state.svelte'
	import type { Snippet } from 'svelte'
	import Icon from './icon.svelte'

	type Props = { children: Snippet }
	let { children }: Props = $props()

	let id = useId()

	const floating = useFloating({
		placement: 'bottom-end',
		middleware: [offset({ crossAxis: 4 }), shift(), flip()],
		whileElementsMounted: autoUpdate,
		onOpenChange: (v) => (store.activePopover = v ? id : null),
		get open() {
			return store.activePopover === id
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
	class="cursor-pointer text-neutral-600 dark:text-neutral-400"
	{...interactions.getReferenceProps()}
>
	<Icon icon="tabler--dots-vertical" class="size-5" />
</button>

<div
	bind:this={floating.elements.floating}
	class={['absolute top-0 left-0 z-100 w-max p-2']}
	style={floating.floatingStyles}
	{...interactions.getFloatingProps()}
>
	{#if floating.open}
		{@render children()}
	{/if}
</div>
