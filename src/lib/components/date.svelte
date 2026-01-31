<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements'
	import type { InferSelectModel } from 'drizzle-orm'

	import type { schema } from '@/server/db'

	import { formatDateTimeOption } from '@/shared/time-format'

	type Props = {
		option: Pick<InferSelectModel<typeof schema.options>, 'startsAt' | 'endsAt'>
	} & HTMLAttributes<HTMLTimeElement>

	let { option, ...rest }: Props = $props()

	const formattedOption = $derived(formatDateTimeOption(option))
</script>

<time datetime={option.startsAt.toString()} {...rest}
	>{formattedOption.weekday}
	<span class="whitespace-nowrap">{formattedOption.date}</span>{#if formattedOption.time}, <span
			class="whitespace-nowrap">{formattedOption.time}</span
		>{/if}</time
>
