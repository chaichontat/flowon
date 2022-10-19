<script lang="ts">
	import Axis from '$src/components/axis.svelte';
	import Contours from '$src/components/contours.svelte';
	import * as d3 from 'd3';
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import colors from 'tailwindcss/colors';
	import Dropdown from './dropdown.svelte';
	import Scatter from './scatter.svelte';

	export let data: Record<string, number>[];
	export let channels: string[];
	export const width = 400;
	export const height = 400;
	const padding = { top: 20, right: 20, bottom: 20, left: 60 };

	let storeSelect = writable(data);
	let selected = [];
</script>

<div class="flex flex-wrap">
	<Scatter {data} {channels} {storeSelect} bind:selected />
	<Scatter data={selected} {channels} {storeSelect} />
</div>
