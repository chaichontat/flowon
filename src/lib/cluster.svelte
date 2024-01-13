<script lang="ts">
	import { writable } from 'svelte/store';

	import Scatter from './scatter.svelte';

	export let data: Record<string, number>[];
	export let channels: string[];
	export let text;
	export const width = 400;
	export const height = 400;

	let storeSelect = writable(data);
	let selected = [];
</script>

<div class="prose">
	<h3>{text?.$FIL}</h3>
</div>

<div class="flex flex-wrap">
	<Scatter {data} {channels} {storeSelect} bind:selected />
	<Scatter data={selected.map((i) => data[i])} {channels} {storeSelect} />
</div>

<div>
	Selected: {selected.length}
</div>
