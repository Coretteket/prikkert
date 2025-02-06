<script lang="ts">
	import { enhance } from '$app/forms'

	let { form } = $props()
</script>

<form method="post" use:enhance class="grid gap-4">
	{#if form?.successMessage}
		<p>{form.successMessage}</p>
	{/if}

	{#if form?.formErrors}
		<p class="text-red-500">{form.formErrors}</p>
	{/if}

	<input type="text" name="name" placeholder="Naam" autocomplete="given-name" class="border rounded p-2" />
	{#if form?.fieldErrors?.name}
		<p class="text-red-500">{form.fieldErrors.name}</p>
	{/if}

	<input type="email" name="email" placeholder="Email" class="border rounded p-2" />
	{#if form?.fieldErrors?.email}
		<p class="text-red-500">{form.fieldErrors.email}</p>
	{/if}

	<input
		type="password"
		name="password"
		placeholder="Wachtwoord"
		autocomplete="new-password"
		class="border rounded p-2"
	/>
	{#if form?.fieldErrors?.password}
		<p class="text-red-500">{form.fieldErrors.password}</p>
	{/if}

	<input
		type="password"
		name="confirmPassword"
		placeholder="Herhaal wachtwoord"
		autocomplete="new-password"
		class="border rounded p-2"
	/>
	{#if form?.fieldErrors?.confirmPassword}
		<p class="text-red-500">{form.fieldErrors.confirmPassword}</p>
	{/if}

	<button type="submit" class="border rounded bg-gray-100 p-2">Registreer</button>
	<a href="/inloggen">Of log in.</a>
</form>
