<script lang="ts">
	import Cluster from '$src/lib/cluster.svelte';
	import { processFCS } from '$src/lib/mine';
	import Observe from '$src/lib/observe.svelte';
	import Scatter from '$src/lib/scatter.svelte';
	import * as Plot from '@observablehq/plot';
	import * as d3 from 'd3';
	import { density2d } from 'fast-kde';
	import type { FileDropOptions, Files } from "filedrop-svelte";
	import FileDrop, { filedrop } from "filedrop-svelte";
	import { onMount } from 'svelte';
	import Colors from 'tailwindcss/colors';
	import parseFCS from '../lib/fcs';

	import { page } from '$app/stores';
	import { error } from '@sveltejs/kit';

	let files: Files;
	let arrayBuf: Promise<ArrayBuffer> | undefined;

	onMount(() => {
		// const getURL = $page.url.searchParams.get('url');
		// if (!getURL || !getURL.endsWith('.fcs')) {
		// 	error(401, 'Invalid URL. URL must ends with .fcs.');
		// }

		// arrayBuf = fetch(getURL).then((x) => x.arrayBuffer());
	});

	$: if (files) {
		files.accepted.forEach((file) => {
			console.log(file);
			arrayBuf = file.arrayBuffer();
		});
	}
</script>

{#if !arrayBuf}
	<div
		class="w-1/2 bg-gray-100 rounded-xl h-32 flex justify-center items-center"
		use:filedrop={{}}
		on:filedrop={(e) => {files = e.detail.files}}
	>
		Drag &amp; drop files
	</div>
{:else}
	{#await arrayBuf.then(processFCS)}
		Loading
	{:then { records, channels, text }}
		<Cluster data={records.slice(0, 10000)} {channels} {text} />
	{/await}
{/if}
