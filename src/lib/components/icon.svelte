<script lang="ts">
	type Props = { icon: string; class?: string }
	let props: Props = $props()
</script>

<span class={['iconify', props.class, props.icon]}></span>
