<script lang="ts" generics="T extends 'button' | 'link' = 'button'">
	import type { ClassValue, HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements'
	import type { Snippet } from 'svelte'

	import { cva, type VariantProps } from 'cva'

	type BaseProps = {
		as?: T
		children?: Snippet
		class?: ClassValue
	} & VariantProps<typeof buttonVariants>

	type AsButtonProps = Omit<HTMLButtonAttributes, keyof BaseProps>
	type AsLinkProps = Omit<HTMLAnchorAttributes, keyof BaseProps>
	type Props = BaseProps & (T extends 'button' ? AsButtonProps : AsLinkProps)

	const buttonVariants = cva({
		base: 'w-fit flex items-center gap-1.5 motion-safe:transition not-disabled:cursor-pointer',
		variants: {
			variant: {
				primary:
					'rounded-lg font-semibold bg-pink-700 text-white shadow not-disabled:hover:bg-pink-800 dark:bg-pink-800 dark:text-neutral-100 dark:not-disabled:hover:bg-pink-700 border dark:border-pink-700 border-pink-800',
				secondary:
					'rounded-lg border bg-white text-neutral-700 not-disabled:hover:bg-neutral-50 dark:bg-neutral-800/50 dark:text-neutral-300 dark:not-disabled:hover:bg-neutral-800',
				tertiary:
					'font-medium text-pink-600 not-disabled:hover:text-pink-800 dark:not-disabled:hover:text-pink-400 dark:text-pink-500',
				ghost: 'rounded not-disabled:hover:bg-neutral-100 not-disabled:dark:hover:bg-neutral-800',
			},
			size: {
				sm: 'px-3 py-1.5 text-sm',
				md: 'px-3 py-1.5',
				icon: 'aspect-square p-2 not-dark:text-neutral-600!',
			},
		},
		defaultVariants: {
			variant: 'secondary',
			size: 'md',
		},
	})

	let { as, children, class: className, variant, size, ...rest }: Props = $props()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const getRestProps = () => rest as any
</script>

{#if as === 'link'}
	<a {...getRestProps()} class={buttonVariants({ variant, size, className })}>
		{@render children?.()}
	</a>
{:else}
	<button {...getRestProps()} class={buttonVariants({ variant, size, className })}>
		{@render children?.()}
	</button>
{/if}
