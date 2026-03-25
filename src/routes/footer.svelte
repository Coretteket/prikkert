<script lang="ts">
	import { page } from '$app/state'

	import { getContent } from '@/shared/content'
	import icon from '@/assets/icon.svg'
	import { url } from '@/shared/url'

	const showAlternatives = $derived(page.route.id === '/' || page.route.id?.startsWith('/vs/'))

	const content = $derived(getContent())
</script>

<footer class="mx-6 mt-12 border-t py-8 text-[15px]">
	<div class="font-[450] text-neutral-500 dark:text-neutral-400">
		<div class="mb-5 text-neutral-700/80 dark:text-neutral-300/80">
			<a
				href={url('/')}
				class="mb-3 inline-flex w-fit items-center gap-2 text-base font-medium hover:underline"
			>
				<img src={icon} width={16} height={16} alt="" class="opacity-50 brightness-0 dark:invert" />
				<span>Prikkert</span>
			</a>
			<p class="text-balance">
				{content.shortDescription}
			</p>
		</div>

		<nav>
			<ul class="flex flex-wrap gap-x-8 gap-y-4 md:gap-y-0 before:hidden md:before:block md:before:basis-full md:before:order-1">
				<li><a href={url('/contact')} class="hover:underline">Contact</a></li>
				<li>
					<a href="https://bunq.me/qcoret" class="hover:underline" target="_blank"> Doneren </a>
				</li>
				<li><a href={url('/privacy')} class="hover:underline">Privacy</a></li>
				<li><a href={url('/voorwaarden')} class="hover:underline">Voorwaarden</a></li>
				<li>
					<a href="https://codeberg.org/qcoret/prikkert" class="hover:underline" target="_blank">
						Open source
					</a>
				</li>
				{#if showAlternatives}
					<li class="md:order-2 md:mt-4">
						<a href={url('/vs/datumprikker')} class="hover:underline">Datumprikker alternatief</a>
					</li>
					<li class="md:order-2 md:mt-4">
						<a href={url('/vs/plennur')} class="hover:underline">Plennur alternatief</a>
					</li>
				{/if}
			</ul>
		</nav>
	</div>
</footer>
