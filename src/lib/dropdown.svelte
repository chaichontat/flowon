<script lang="ts">
	export let channels: string[];
	export let curr: string;
	export let isLog = false;
	let cl = '';
	export { cl as class };
</script>

<select class={cl} bind:value={curr}>
	{#each channels as channel}
		<option>{channel}</option>
	{/each}
</select>

<span class="ml-2 flex-inline space-x-2">
	<input type="checkbox" bind:checked={isLog} />
	Log
</span>
