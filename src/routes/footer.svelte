<script lang="ts">
	import { page } from '$app/state'

	import { shortDescription } from '@/shared/seo/meta'
	import icon from '@/assets/icon.svg'
	import { url } from '@/shared/url'

	const showAlternatives = $derived(page.route.id === '/' || page.route.id?.startsWith('/vs/'))
</script>

<footer class="mx-6 mt-12 border-t py-8 text-[15px]">
	<div
		class="flex flex-wrap justify-between gap-x-8 gap-y-6 text-neutral-500 max-sm:flex-col dark:text-neutral-400"
	>
		<div>
			<a
				href={url('/')}
				class="mb-3 inline-flex w-fit items-center gap-2 text-base font-medium text-neutral-700/80 hover:underline dark:text-neutral-300/80"
			>
				<img src={icon} width={16} height={16} alt="" class="opacity-50 brightness-0 dark:invert" />
				<span>Prikkert</span>
			</a>
			<p class="text-balance">
				{shortDescription}
			</p>
		</div>

		<div class="flex flex-wrap gap-x-8 font-[450] gap-y-3">
			<a href={url('/privacy')} class="hover:underline">Privacy</a>
			<a href={url('/voorwaarden')} class="hover:underline">Voorwaarden</a>
			<a href="https://codeberg.org/qcoret/prikkert" class="hover:underline" target="_blank">
				Open source
			</a>

			{#if showAlternatives}
				<a href={url('/vs/datumprikker')} class="hover:underline">Datumprikker alternatief</a>
				<a href={url('/vs/plennur')} class="hover:underline">Plennur alternatief</a>
			{/if}
		</div>
	</div>
</footer>
