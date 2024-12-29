<script lang="ts">
	import { enhance } from '$app/forms'

  let { data } = $props();
</script>

<h1 class="font-bold">Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<pre>{JSON.stringify(data.users, null, 2)}</pre>

<form method="post" use:enhance>
  <input type="text" name="name" placeholder="Name" />
  <input type="email" name="email" placeholder="Email" />
  <input type="password" name="password" placeholder="Password" />
  <button type="submit">Submit</button>
</form>