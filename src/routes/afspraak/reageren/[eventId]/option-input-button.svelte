<script lang="ts">
	import Icon from '@/components/icon.svelte'

	type Props = {
		value: string
		icon: string
		label: string
		class: string
		availability: string
		name: string
		// handleAvailabilityChange: (value: string) => void
	}

	let {
		value,
		icon,
		label,
		class: className,
		availability = $bindable(),
		name,
		// handleAvailabilityChange,
	}: Props = $props()
</script>

<label class="group cursor-pointer">
	<input
		type="radio"
		{name}
		{value}
		checked={availability === value}
		class="peer absolute opacity-0"
		bind:group={availability}
	/>
	<span
		class={[
			'relative flex items-center gap-1.5 border px-3 py-2 text-sm leading-none font-medium text-neutral-700 peer-focus-visible:z-100 peer-focus-visible:outline-focus motion-safe:transition-colors dark:bg-neutral-800/50 dark:text-neutral-300',
			className,
		]}
	>
		<Icon {icon} class="size-5" />
		<span class="max-xs:hidden">{label}</span>
	</span>
</label>
