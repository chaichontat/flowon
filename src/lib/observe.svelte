<script lang="ts">
	import { processFCS } from '$src/lib/mine';

	import Observe from '$src/lib/observe.svelte';
	import Scatter from '$src/lib/scatter.svelte';
	import * as Plot from '@observablehq/plot';
	import * as d3 from 'd3';
	import { density2d } from 'fast-kde';
	import { onMount } from 'svelte';
	import Colors from 'tailwindcss/colors';
	import Dropdown from './dropdown.svelte';
	import { what } from './what';

	export let data: Record<string, number>[];

	export let channels: string[];
	export const width = 600;
	export const height = 600;

	let svg: SVGSVGElement;

	function genKDE(data: Record<string, number>[], x: string, y: string, bins = 128) {
		const extent = [
			[0, d3.max(data, (d) => d[x])],
			[0, Math.log10(d3.max(data, (d) => d[y] + 1))]
		];
		const xScale = d3
			.scaleLinear()
			.domain(extent[0])
			.range([0, 127])
			.interpolate(d3.interpolateRound);
		const yScale = d3
			.scaleLinear()
			.domain(extent[1])
			.range([0, 127])
			.interpolate(d3.interpolateRound);

		const kde = density2d(data, {
			x,
			y,
			extent,
			bins: [128, 128]
		});

		const kdep = [...kde];
		const max = 1 / d3.max(kdep, (d) => d.z);
		// fill: (d) => kdep[yScale(yy(d)) * 128 + xScale(xx(d))].z * max,
		return { kde, xScale, yScale };
	}
	let x: string = '';

	onMount(() => {
		what();
		const y = 'FSC-A';

		const mode = { x: 'log', y: 'log' };

		const factory = (v: string) => (d: Record<string, number>) => Math.log10(Math.max(0, d[v]) + 1);
		const identity = (v: string) => (d: Record<string, number>) => d[v];

		const xx = mode.x === 'log' ? factory(x) : identity(x);
		const yy = mode.y === 'log' ? factory(y) : identity(y);

		const extent = [
			[0, mode.x === 'log' ? d3.max(data, xx) : 262144],
			[0, mode.y === 'log' ? d3.max(data, yy) : 262144]
		];

		let pl = Plot.plot({
			inset: 30,
			marks: [
				Plot.dot(data, {
					x,
					y,
					r: 0.7,
					fillOpacity: 0.4
					// fill: (d) => d3.interpolateTurbo(kdep[xScale(d[x]) * 128 + yScale(d[y])].z),
				})
			],
			marginLeft: 80,
			grid: true
			// color: { scheme: 'turbo' },
			// x: { domain: extent[0], type: mode.x },
			// y: { domain: extent[1], type: mode.y }
		});

		// const xs = d3.scaleLinear().domain([0, 250000]).range([80, 566]);
		// const ys = d3.scaleLinear().domain([0, 250000]).range([341, 63]);

		const c = d3
			.select(pl)
			.selectAll('path')
			.on('mouseover', (d: MouseEvent) => {
				d.target!.setAttribute('stroke-width', 2);
				console.log(d.target);
			})
			.on('mouseout', (d: MouseEvent) => {
				d.target!.setAttribute('stroke-width', 0.25);
			});

		svg.appendChild(pl);
	});
</script>

<svg bind:this={svg} {width} {height} />

<Dropdown {channels} bind:curr={x} />
