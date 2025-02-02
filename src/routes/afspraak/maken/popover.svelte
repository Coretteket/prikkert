<script lang="ts">
	import { store } from '@/state.svelte'
	import { IconDotsVertical } from '@tabler/icons-svelte'
	import { type Snippet } from 'svelte'

	type Props = { id: string; children: Snippet }
	let { id, children }: Props = $props()

	let open = $derived(store.activePopover === id)
</script>

<div class="relative flex items-center">
	<button
		type="button"
		class="cursor-pointer text-stone-600"
		onclick={() => (store.activePopover = open ? null : id)}
	>
		<IconDotsVertical size={20} />
	</button>

	{#if open}
		<div class={'absolute top-10 right-1 z-10 w-max'}>
			{@render children()}
		</div>
	{/if}
</div>
