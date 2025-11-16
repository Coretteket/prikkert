<script lang="ts">
	import type { ClassValue, HTMLAttributes } from 'svelte/elements'
	type Props = { icon: string; class?: ClassValue } & HTMLAttributes<HTMLSpanElement>
	let { class: className, icon, ...rest }: Props = $props()
</script>

<span class={['iconify', className, icon]} {...rest}></span>