<script lang="ts">
	import type { HTMLDialogAttributes } from 'svelte/elements'
	import type { Snippet } from 'svelte'

	let element: HTMLDialogElement | undefined = $state()

	let {
		open = $bindable(false),
		children,
		...rest
	}: { open: boolean; children: Snippet } & HTMLDialogAttributes = $props()

	$effect(() => {
		if (open) element?.showModal()
		else element?.close()
	})

	const handleClose = () => (open = false)

	function dialogHandler(node: HTMLDialogElement) {
		node.addEventListener('close', handleClose)
		return () => node.removeEventListener('close', handleClose)
	}
</script>

<dialog
	bind:this={element}
	{@attach dialogHandler}
	{...rest}
	class={[
		'dark:bg-neutral-850 fixed top-1/2 left-1/2 w-full -translate-1/2 rounded-lg border bg-white p-5 backdrop:bg-black/50 backdrop:backdrop-blur-[2px] sm:max-w-md sm:p-6',
		rest.class,
	]}
>
	{#if open}
		{@render children()}
	{/if}
</dialog>

<style>
	:global(body):has(dialog[open]) {
		overflow: hidden;
	}
</style>
