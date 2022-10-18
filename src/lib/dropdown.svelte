<script lang="ts">
	export let channels: string[];
	export let curr: string;
	let cl = '';
	export { cl as class };
</script>

<select class={cl} bind:value={curr}>
	{#each channels as channel}
		<option>{channel}</option>
	{/each}
</select>
