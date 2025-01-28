<script lang="ts">
	import { enhance } from '$app/forms'

	let { form } = $props()
</script>

<form method="post" use:enhance class="grid gap-4">
	{#if form?.formErrors}
		<p class="text-red-500">{form.formErrors}</p>
	{/if}

	<input type="email" name="email" placeholder="Email" class="border p-2" />
	{#if form?.fieldErrors?.email}
		<p class="text-red-500">{form.fieldErrors.email}</p>
	{/if}
	<input type="password" name="password" placeholder="Wachtwoord" class="border p-2" />
	{#if form?.fieldErrors?.password}
		<p class="text-red-500">{form.fieldErrors.password}</p>
	{/if}

	<button type="submit" class="border bg-stone-100 p-2">Login</button>
	<a href="/registreren">Of registreer.</a>
</form>
