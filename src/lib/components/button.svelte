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
		base: 'w-fit flex items-center gap-2 motion-safe:transition not-disabled:cursor-pointer',
		variants: {
			variant: {
				primary:
					'font-semibold bg-pink-700 text-white not-disabled:hover:bg-pink-800 dark:bg-pink-800 dark:not-disabled:hover:bg-pink-700 border dark:border-pink-700 border-pink-900',
				secondary:
					'font-medium border bg-white text-neutral-700 not-disabled:hover:bg-neutral-100 dark:bg-neutral-800/50 dark:text-neutral-300 dark:not-disabled:hover:bg-neutral-700/50',
				tertiary:
					'font-semibold text-pink-600 not-disabled:hover:text-pink-800 dark:not-disabled:hover:text-pink-400 dark:text-pink-500',
				ghost:
					'font-[450] not-disabled:hover:bg-neutral-100 not-disabled:dark:hover:bg-neutral-800',
			},
			size: {
				sm: 'px-2.5 py-1.5 text-[15px] rounded-lg',
				md: 'px-3 py-1.5 squircle',
				lg: 'px-4 py-1.5 text-lg squircle',
				icon: 'aspect-square p-2 squircle not-dark:text-neutral-600!',
			},
		},
		compoundVariants: [{ variant: 'secondary', size: 'sm', class: 'font-[450]!' }],
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
