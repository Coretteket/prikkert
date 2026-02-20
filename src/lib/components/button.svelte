<script lang="ts" generics="T extends 'button' | 'link' = 'button'">
	import type { ClassValue, HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements'
	import type { Snippet } from 'svelte'

	import { cva, type VariantProps } from 'cva'

	type BaseProps = {
		as?: T
		children?: Snippet
		class?: ClassValue
	}

	type Variants = VariantProps<typeof buttonVariants>

	type SizeProps =
		| { size: 'icon'; label: string }
		| { size?: Exclude<Variants['size'], 'icon'>; label?: string }

	type AsButtonProps = Omit<HTMLButtonAttributes, keyof BaseProps | 'size' | 'label'>
	type AsLinkProps = Omit<HTMLAnchorAttributes, keyof BaseProps | 'size' | 'label'>

	type Props = BaseProps &
		Omit<Variants, 'size'> &
		SizeProps &
		(T extends 'button' ? AsButtonProps : AsLinkProps)

	const buttonVariants = cva({
		base: 'w-fit squircle flex items-center gap-2 motion-safe:transition cursor-pointer disabled:cursor-not-allowed',
		variants: {
			variant: {
				primary:
					'font-semibold bg-pink-700 text-white not-disabled:hover:bg-pink-800 dark:bg-pink-800 dark:not-disabled:hover:bg-pink-700 border dark:border-pink-700 border-pink-900',
				secondary:
					'font-medium border bg-white text-neutral-700 not-disabled:hover:bg-neutral-100 dark:bg-neutral-800/50 dark:text-neutral-300 dark:not-disabled:hover:bg-neutral-700/50',
				ghost:
					'font-[450] not-disabled:hover:bg-neutral-100 not-disabled:dark:hover:bg-neutral-800',
			},
			size: {
				sm: 'px-2.5 py-1.5 text-[15px]',
				md: 'px-3 py-1.5',
				lg: 'px-3.5 py-1.5 text-lg',
				icon: 'aspect-square p-2 text-neutral-600 dark:text-neutral-300',
			},
		},
		compoundVariants: [{ variant: 'secondary', size: 'sm', class: 'font-[450]!' }],
		defaultVariants: {
			variant: 'secondary',
			size: 'md',
		},
	})

	let { as, children, class: className, variant, size, label, ...rest }: Props = $props()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const getRestProps = () => rest as any
</script>

{#if as === 'link'}
	<a
		title={label}
		{...getRestProps()}
		class={buttonVariants({ variant, size, className })}
		aria-label={label}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		title={label}
		{...getRestProps()}
		class={buttonVariants({ variant, size, className })}
		aria-label={label}
	>
		{@render children?.()}
	</button>
{/if}
