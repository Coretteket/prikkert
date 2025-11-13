<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements"
	type Props = { icon: string; class?: string } & HTMLAttributes<HTMLSpanElement>
	let props: Props = $props()
</script>

<span class={['iconify', props.class, props.icon]}></span>
