<script lang="ts">
	import { enhance } from '$app/forms'
</script>

<form method="POST" use:enhance class="grid gap-4">
	<label class="grid">
		<span>Naam</span>
		<input type="text" name="title" required class="border p-1"/>
	</label>
	<label class="grid">
		<span>Datums</span>
		<textarea name="dates" required class="border p-1"></textarea>
	</label>
	<button type="submit" class="border p-1">Afspraak maken</button>
</form>
