<script lang="ts">
	import { enhance } from '$app/forms'
</script>

<form method="post" use:enhance class="grid gap-4">
	<input type="text" name="name" placeholder="Naam" class="border p-2" />
	<input type="email" name="email" placeholder="Email" class="border p-2" />
	<input type="password" name="password" placeholder="Wachtwoord" class="border p-2" />
	<input
		type="password"
		name="confirmPassword"
		placeholder="Herhaal wachtwoord"
		class="border p-2"
	/>
	<button type="submit" class="border bg-stone-100 p-2">Registreren</button>
	<a href="/registreren">Of log in.</a>
</form>
