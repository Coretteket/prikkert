<script lang="ts">
	import type { InferSelectModel } from 'drizzle-orm'

	import type { schema } from '@/server/db'

	import { formatDateTimeOption } from '@/shared/time-format'

	let { option }: { option: Pick<InferSelectModel<typeof schema.options>, 'startsAt' | 'endsAt'> } =
		$props()

	const formattedOption = $derived(formatDateTimeOption(option))
</script>

{formattedOption.weekday}
<span class="whitespace-nowrap">{formattedOption.date}</span>{#if formattedOption.time}, <span
		class="whitespace-nowrap">{formattedOption.time}</span
	>{/if}
