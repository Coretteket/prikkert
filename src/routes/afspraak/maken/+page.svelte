<script lang="ts">
	import { enhance } from '$app/forms'
	import DatePicker from './date-picker.svelte'
</script>

<form method="POST" use:enhance class="grid gap-4">
	<label class="grid" for="">Naam</label>
	<input id="form-name" type="text" name="title" required class="border p-1" />
	<label class="grid" for="form-dates">Datums</label>
	<div id="form-dates"><DatePicker /></div>
	<button type="submit" class="border p-1">Afspraak maken</button>
</form>
