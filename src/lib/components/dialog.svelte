<script lang="ts">
	import type { HTMLDialogAttributes } from 'svelte/elements'
	import type { Snippet } from 'svelte'

	let element: HTMLDialogElement

	let {
		open = $bindable(false),
		children,
		...rest
	}: { open: boolean; children: Snippet } & HTMLDialogAttributes = $props()

	$effect(() => {
		if (open) element.showModal()
		else element.close()
	})

	const handleClose = () => (open = false)

	function dialogHandler(node: HTMLDialogElement) {
		node.addEventListener('close', handleClose)
		return () => node.removeEventListener('close', handleClose)
	}
</script>

<dialog bind:this={element} {@attach dialogHandler} {...rest}>
	{#if open}
		{@render children()}
	{/if}
</dialog>
