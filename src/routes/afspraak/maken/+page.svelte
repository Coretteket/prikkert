<script lang="ts">
	import { enhance } from '$app/forms'
	import DatePicker from './date-picker.svelte'

	let { form } = $props()
</script>

<form method="POST" use:enhance class="grid gap-4">
	{#if form?.formErrors}
		<p class="text-red-500">{form.formErrors}</p>
	{/if}
	<label class="grid" for="">Naam</label>
	<input id="form-name" type="text" name="title" class="border p-1" />
	{#if form?.fieldErrors?.title}
		<p class="text-red-500">{form.fieldErrors.title}</p>
	{/if}
	<label class="grid" for="form-dates">Datums</label>
	<div id="form-dates"><DatePicker /></div>
	{#if form?.fieldErrors?.options}
		<p class="text-red-500">{form.fieldErrors.options}</p>
	{/if}

	<button type="submit" class="border p-1">Afspraak maken</button>
</form>
