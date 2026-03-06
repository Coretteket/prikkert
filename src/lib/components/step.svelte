<script lang="ts">
	let { n, bold, normal }: { n: number; bold: string; normal: string } = $props()
</script>

<div class="mb-8 flex items-start gap-4">
	<div class="flex aspect-square size-8 items-center justify-center squircle bg-pink-500/30">
		<p class="font-semibold text-pink-700 dark:text-pink-100">{n}</p>
	</div>
	<p class="text-neutral-700 sm:text-lg dark:text-neutral-300">
		<b class="font-semibold text-neutral-800 dark:text-neutral-200">{bold}</b>
		{normal}
	</p>
</div>
