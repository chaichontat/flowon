<script lang="ts">
	import Cluster from '$src/lib/cluster.svelte';
	import { processFCS } from '$src/lib/mine';
	import Observe from '$src/lib/observe.svelte';
	import Scatter from '$src/lib/scatter.svelte';
	import * as Plot from '@observablehq/plot';
	import * as d3 from 'd3';
	import { density2d } from 'fast-kde';
	import { onMount } from 'svelte';
	import Colors from 'tailwindcss/colors';
	import parseFCS from '../lib/fcs';

	// function genKDE(data, x, y, bins = 128) {
	// 	const extent = [
	// 		[0, d3.max(data, (d) => d[x])],
	// 		[0, Math.log10(d3.max(data, (d) => d[y] + 1))]
	// 	];
	// 	const xScale = d3
	// 		.scaleLinear()
	// 		.domain(extent[0])
	// 		.range([0, 127])
	// 		.interpolate(d3.interpolateRound);
	// 	const yScale = d3
	// 		.scaleLinear()
	// 		.domain(extent[1])
	// 		.range([0, 127])
	// 		.interpolate(d3.interpolateRound);

	// 	const kde = density2d(data, {
	// 		x,
	// 		y: (d) => Math.log10(Math.max(0, d[y]) + 1),
	// 		extent,
	// 		bins: [128, 128]
	// 	});
	// 	return { kde, xScale, yScale };
	// }

	// async function genmine(width = 600, height = 600) {
	// 	const x = 'FSC-H';
	// 	const y = 'FITC-A';
	// 	const buf = await fetch('/Specimen_001_NoStain.fcs').then((x) => x.arrayBuffer());
	// 	const fcs = parseFCS(buf);
	// 	const channels = fcs.parameters.map((x, i) => x[`$P${i + 1}N`]);
	// 	console.log(channels);

	// 	const data = fcs.data.map((x) => {
	// 		const obj = {};
	// 		channels.forEach((y, i) => (obj[y] = x[i]));
	// 		return obj;
	// 	});

	// 	const extent = [
	// 		[0, d3.max(data, (d) => d[x])],
	// 		[0, d3.max(data, (d) => d[y] + 1)]
	// 	];

	// 	const xScale = d3
	// 		.scaleLinear()
	// 		.domain(extent[0])
	// 		.range([0, 127])
	// 		.interpolate(d3.interpolateRound);
	// 	const yScale = d3
	// 		.scaleLinear()
	// 		.domain(extent[1])
	// 		.range([0, 127])
	// 		.interpolate(d3.interpolateRound);

	// 	d3.select('#playground')
	// 		.selectAll('svg')
	// 		.data([1])
	// 		.enter()
	// 		.append('svg')
	// 		.attr('width', width)
	// 		.attr('height', height)
	// 		.append('g')
	// 		.data(data)
	// 		.enter()
	// 		.append('circle')
	// 		.attr('cx', (d) => xScale(d[x]))
	// 		.attr('cy', (d) => 128 - yScale(d[y] + 1))
	// 		.attr('r', 1)
	// 		.attr('fill', 'steelblue');
	// }

	export let data;
	$: ({ arrayBuf } = data);

	// onMount(async () => {
	// 	({ records, channels, text } = processFCS(await ));
	// 	records = records.map((x, i) => ({ ...x, idx: i }));

	// const c = d3
	// 	.select(pl)
	// 	.selectAll('path')
	// 	.on('mouseover', (d: MouseEvent) => {
	// 		d.target!.setAttribute('stroke-width', 2);
	// 		console.log(d.target);
	// 	})
	// 	.on('mouseout', (d: MouseEvent) => {
	// 		d.target!.setAttribute('stroke-width', 0.25);
	// 	});
</script>

{#await arrayBuf.then(processFCS)}
	Loading
{:then { records, channels, text }}
	<Cluster data={records} {channels} {text} />
{/await}
