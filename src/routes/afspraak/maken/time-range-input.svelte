<script lang="ts">
	import TimeInput from './time-input.svelte'
</script>

<div class="flex items-center gap-3">
	<TimeInput type="hour" />
	:
	<TimeInput type="minute" />
	&mdash;
	<TimeInput type="hour" />
	:
	<TimeInput type="minute" />
</div>
