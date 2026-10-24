<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'

	import Icon from '#lib/components/icon.svelte'

	type Props = {
		value: string
		icon: string
		label: string
		class: string
		availability: string
		input: HTMLInputAttributes
		disabled?: boolean
		// handleAvailabilityChange: (value: string) => void
	}

	let {
		value,
		icon,
		label,
		class: className,
		availability = $bindable(),
		input,
		disabled = false,
		// handleAvailabilityChange,
	}: Props = $props()
</script>

<label class="group cursor-pointer has-disabled:cursor-not-allowed">
	<input
		type="radio"
		name={input.name}
		{value}
		{disabled}
		aria-label={label}
		checked={availability === value}
		class="peer absolute opacity-0"
		bind:group={availability}
	/>
	<span
		class={[
			'relative flex items-center gap-1.5 border px-3.5 py-2.5 text-[15px] leading-none font-medium text-neutral-700 peer-focus-visible:z-100 peer-focus-visible:outline-focus motion-safe:transition-colors dark:bg-neutral-825 dark:text-neutral-300',
			className,
		]}
	>
		<Icon {icon} class="size-5" />
		<span class="max-xs:hidden">{label}</span>
	</span>
</label>
