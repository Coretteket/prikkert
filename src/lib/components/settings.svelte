<script lang="ts">
	import { invalidateAll } from '$app/navigation'
	import { page } from '$app/state'

	import { getTimezone, setTimezone, setTheme, setLocale } from '@/client/cookies'
	import { detectTimezone, formatTimezoneID } from '@/shared/timezone'
	import { createPopover } from '@/shared/popover.svelte'
	import Button from '@/components/button.svelte'
	import Dialog from '@/components/dialog.svelte'
	import Icon from '@/components/icon.svelte'

	const popover = createPopover({ positionArea: 'bottom span-left' })

	let timezoneDialog = $state(false)
</script>

<Button size="icon" label="Instellingen" {@attach popover.triggerHandler} {...popover.triggerAttrs}>
	<Icon icon="tabler--settings" class="size-5" />
</Button>

<div
	{@attach popover.floatingHandler}
	{...popover.floatingAttrs}
	class="grid min-w-40 gap-1 rounded-lg border bg-white px-1.5 py-2 text-neutral-700 ring-4 ring-white dark:bg-neutral-850 dark:text-neutral-300 dark:ring-neutral-850"
>
	<Button
		lang={page.data.locale === 'en' ? 'nl' : undefined}
		variant="ghost"
		size="sm"
		class="w-full!"
		{@attach popover.closeHandler}
		{...popover.closeAttrs}
		onclick={() => setLocale('nl')}
	>
		<Icon icon="tabler--cheese" class="size-5" />
		<span>Nederlands</span>
	</Button>
	<Button
		lang={page.data.locale === 'nl' ? 'en' : undefined}
		variant="ghost"
		size="sm"
		class="w-full!"
		{@attach popover.closeHandler}
		{...popover.closeAttrs}
		onclick={() => setLocale('en')}
	>
		<Icon icon="tabler--teapot" class="size-5" />
		<span>English</span>
	</Button>
	<hr class="mx-2 my-1" />
	<Button
		variant="ghost"
		size="sm"
		class="w-full!"
		{@attach popover.closeHandler}
		{...popover.closeAttrs}
		onclick={() => setTheme('light')}
	>
		<Icon icon="tabler--sun" class="size-5" />
		<span>Licht thema</span>
	</Button>
	<Button
		variant="ghost"
		size="sm"
		class="w-full!"
		{@attach popover.closeHandler}
		{...popover.closeAttrs}
		onclick={() => setTheme('dark')}
	>
		<Icon icon="tabler--moon" class="size-5" />
		<span>Donker thema</span>
	</Button>
	<Button
		variant="ghost"
		size="sm"
		class="w-full!"
		{@attach popover.closeHandler}
		{...popover.closeAttrs}
		onclick={() => setTheme('system')}
	>
		<Icon icon="tabler--device-desktop" class="size-5" />
		<span>Systeemthema</span>
	</Button>
	<hr class="mx-2 my-1" />
	<Button
		variant="ghost"
		size="sm"
		class="w-full!"
		{@attach popover.closeHandler}
		{...popover.closeAttrs}
		onclick={() => (timezoneDialog = true)}
	>
		<Icon icon="tabler--clock" class="size-5" />
		<span>Tijdzone...</span>
	</Button>
</div>

<Dialog bind:open={timezoneDialog}>
	<form method="dialog">
		<p class="mb-4 text-lg font-medium">Tijdzone</p>
		<p class="mb-6 text-neutral-700 dark:text-neutral-300">
			Kies de tijdzone waarin je tijden wilt weergeven.
		</p>

		<select
			class="mb-6 block w-full rounded-lg border px-4 py-2.5 dark:bg-neutral-800/50"
			value={getTimezone() ?? 'AUTOMATIC'}
			onchange={(e) => {
				setTimezone(e.currentTarget.value)
				invalidateAll()
			}}
		>
			<option value="AUTOMATIC">
				Automatisch ({formatTimezoneID(detectTimezone())})
			</option>
			{#each Intl.supportedValuesOf('timeZone') as tz}
				<option value={tz}>{formatTimezoneID(tz)}</option>
			{/each}
		</select>

		<Button variant="secondary" class="ml-auto" autofocus>Sluiten</Button>
	</form>
</Dialog>
