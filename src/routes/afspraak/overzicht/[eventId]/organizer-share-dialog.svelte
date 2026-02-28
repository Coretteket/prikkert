<script lang="ts">
	import { browser } from '$app/environment'

	import Dialog from '@/components/dialog.svelte'
	import Button from '@/components/button.svelte'
	import Icon from '@/components/icon.svelte'

	import { getOrganizerShareLink } from './action.remote'

	let { id, open = $bindable(false) }: { id: string; open: boolean } = $props()

	const shareLink = $derived(open ? await getOrganizerShareLink(id) : '')

	let linkCopied = $state(false)
</script>

<Dialog bind:open>
	<form method="dialog">
		<p class="mb-4 text-lg font-medium">Afspraakbeheer delen</p>
		<p class="mb-6 text-neutral-700 dark:text-neutral-300">
			Met de onderstaande link kan deze afspraak ook op andere apparaten worden beheerd. Deel deze
			alleen met mensen die je vertrouwt.
		</p>

		<output
			class="mb-4 block h-11.25 overflow-x-scroll rounded-lg border px-4 py-2.5 text-[15px] text-neutral-700 dark:bg-neutral-825 dark:text-neutral-300"
		>
			{shareLink}
		</output>

		<div class="mb-4 flex gap-3">
			<Button
				type="button"
				variant="secondary"
				size="sm"
				onclick={() => {
					navigator.clipboard.writeText(shareLink)
					linkCopied = true
					setTimeout(() => (linkCopied = false), 1000)
				}}
			>
				<Icon icon={linkCopied ? 'tabler--copy-check' : 'tabler--copy'} class="size-4.5" />
				Link kopiëren
			</Button>

			{#if !browser || navigator.share}
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onclick={() => navigator.share({ url: shareLink })}
				>
					<Icon icon="tabler--share" class="size-4.5" />
					Link delen
				</Button>
			{:else}
				<Button
					variant="secondary"
					size="sm"
					as="link"
					href="mailto:?body={encodeURIComponent(shareLink)}"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Icon icon="tabler--mail" class="size-4.5" />
					Delen via mail
				</Button>
			{/if}
		</div>

		<Button variant="secondary" class="ml-auto" autofocus>Sluiten</Button>
	</form>
</Dialog>
