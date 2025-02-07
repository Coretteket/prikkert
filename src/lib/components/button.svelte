<script lang="ts" generics="T extends 'button' | 'link' = 'button'">
	import { cva, type VariantProps } from 'cva'
	import type { Snippet } from 'svelte'
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements'

	type BaseProps = {
		as?: T
		children?: Snippet
		class?: string
	} & VariantProps<typeof buttonInner>

	type AsButtonProps = Omit<HTMLButtonAttributes, keyof BaseProps>
	type AsLinkProps = Omit<HTMLAnchorAttributes, keyof BaseProps>
	type Props = BaseProps & (T extends 'button' ? AsButtonProps : AsLinkProps)

	const button = cva({
		base: 'group relative block w-fit translate-y-1 cursor-pointer border transition',
		variants: {
			color: {
				primary: 'border-rose-900 bg-rose-800',
				secondary: 'border-gray-300 bg-gray-100',
			},
			size: {
				md: 'rounded-md',
				lg: 'rounded-md',
			},
		},
		defaultVariants: {
			color: 'secondary',
			size: 'md',
		},
	})

	const buttonInner = cva({
		base: 'flex -translate-y-1 items-center gap-1.5 outline transition-all group-hover:-translate-y-1.5 group-active:-translate-y-0.5',
		variants: {
			color: {
				primary: 'bg-rose-700 font-bold text-white outline-rose-900',
				secondary: 'bg-white text-gray-700 outline-gray-300',
			},
			size: {
				md: 'rounded-md px-3 py-1.5 text-sm',
				lg: 'rounded-md px-4.5 py-1.5 text-base',
			},
		},
		defaultVariants: {
			color: 'secondary',
			size: 'md',
		},
	})

	let { as, children, class: className, color, size, ...rest }: Props = $props()
</script>

{#if as === 'link'}
	<!-- @ts-expect-error - too complex, eh -->
	<a {...rest as AsLinkProps} class={button({ color, size, className })}>
		<span class={buttonInner({ color, size })}>
			{@render children?.()}
		</span>
	</a>
{:else}
	<button {...rest as AsButtonProps} class={button({ color, size, className })}>
		<span class={buttonInner({ color, size })}>
			{@render children?.()}
		</span>
	</button>
{/if}
