<script lang="ts" generics="T extends 'button' | 'link' = 'button'">
	import { cva, type VariantProps } from 'cva'
	import type { Snippet } from 'svelte'
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements'

	type BaseProps = {
		as?: T
		children?: Snippet
		class?: string
	} & VariantProps<typeof buttonVariants>

	type AsButtonProps = Omit<HTMLButtonAttributes, keyof BaseProps>
	type AsLinkProps = Omit<HTMLAnchorAttributes, keyof BaseProps>
	type Props = BaseProps & (T extends 'button' ? AsButtonProps : AsLinkProps)

	const buttonVariants = cva({
		base: 'w-fit flex items-center gap-1.5 transition cursor-pointer',
		variants: {
			variant: {
				primary:
					'rounded-lg font-semibold bg-pink-700 text-white shadow hover:bg-pink-800 dark:bg-pink-800 dark:text-zinc-100 dark:hover:bg-pink-700',
				secondary:
					'rounded-lg border bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800',
				tertiary:
					'font-medium text-pink-600 hover:text-pink-800 dark:hover:text-pink-400 dark:text-pink-500',
				ghost: 'rounded hover:bg-zinc-100 dark:hover:bg-zinc-800',
			},
			size: {
				sm: 'px-3 py-1.5 text-sm',
				md: 'px-4 py-2',
				icon: 'p-2 not-dark:text-zinc-600!',
			},
		},
		defaultVariants: {
			variant: 'secondary',
			size: 'md',
		},
	})

	let { as, children, class: className, variant, size, ...rest }: Props = $props()

	const getRestProps = () => rest as any // to avoid overly complex type issues
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
