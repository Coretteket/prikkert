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
				primary: 'border-pink-900 bg-pink-800 dark:bg-pink-900',
				secondary: 'border-zinc-300 bg-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-800',
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
				primary: 'bg-pink-700 font-bold text-white outline-pink-900 dark:bg-pink-800',
				secondary: 'bg-white text-zinc-600 outline-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:outline-zinc-800',
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
