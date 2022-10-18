<script lang="ts">
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

	let data: Record<string, number>[] = [];
	let channels: string[] = [];

	onMount(async () => {
		const buf = await fetch('/Specimen_001_5ug,2f,ml in 25ul.fcs').then((x) => x.arrayBuffer());
		({ data, channels } = processFCS(buf));

		const x = 'FITC-A';
		const y = 'FSC-A';
		const bandwidth = 5;

		const mode = { x: 'log', y: 'log' };

		const factory = (v: string) => (d: Record<string, number>) => Math.log10(Math.max(0, d[v]) + 1);
		const identity = (v: string) => (d: Record<string, number>) => d[v];

		const xx = mode.x === 'log' ? factory(x) : identity(x);
		const yy = mode.y === 'log' ? factory(y) : identity(y);

		const extent = [
			[0, mode.x === 'log' ? d3.max(data, xx) : 262144],
			[0, mode.y === 'log' ? d3.max(data, yy) : 262144]
		];

		console.log(extent);

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
			x: xx,
			y: yy,
			extent,
			bandwidth: [2000, 0.3],
			bins: [128, 128]
		});
		//
		// 	'hi',

		const kdep = [...kde];
		// console.log(data.map((d) => yScale(Math.log10(Math.max(0, d[y]) + 1))));

		const max = 1 / d3.max(kdep, (d) => d.z);
		// console.log(
		// 	data.map((d) => (kdep[yScale(Math.log10(d[y] + 1)) * 128 + xScale(d[x])]?.z ?? 0) * max)
		// );
		// console.log(max);

		// 	data.map((d) => kdep[xScale(d[x]) * 128 + yScale(d[y])]).map((x) => x?.z)
		// );

		const t = d3.interpolateRgb('white', 'black');
		// console.log(kde.map((x) => x.z).filter((x) => x > 0));
		const cmap = d3.piecewise(d3.interpolateRgb.gamma(2.2), ['red', 'green', 'blue']);
		console.log(data);

		let pl = Plot.plot({
			inset: 30,
			marks: [
				Plot.dot(data, {
					x,
					y,
					fill: (d) => kdep[yScale(yy(d)) * 128 + xScale(xx(d))].z * max,
					r: 0.7,
					fillOpacity: 0.4
					// fill: (d) => d3.interpolateTurbo(kdep[xScale(d[x]) * 128 + yScale(d[y])].z),
				})
			],
			marginLeft: 50,
			grid: true,
			color: { scheme: 'turbo' },
			x: { domain: extent[0], type: mode.x },
			y: { domain: extent[1], type: mode.y }
		});

		const xs = d3.scaleLinear().domain([0, 250000]).range([80, 566]);
		const ys = d3.scaleLinear().domain([0, 250000]).range([341, 63]);

		const brush = d3.brush().on('start brush end', ({ selection }) => {
			// let value = [];
			if (selection) {
				const [[x0, y0], [x1, y1]] = selection;
				// console.log(xs.invert(x0), ys.invert(y0), xs.invert(x1), ys.invert(y1));
				d3.selectAll('circle')
					.style('fill', 'gray')
					.filter((d) => {
						return x0 <= xs(d[x]) && xs(d[x]) <= x1 && y0 <= ys(d[y]) && ys(d[y]) <= y1;
					})
					.style('fill', 'steelblue');
			} else {
				// d3.selectAll('circle').style('fill', 'gray');
			}
		});

		// d3.select(svg).call(brush);

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

		// Compute the contour polygons at log-spaced intervals; returns an array of MultiPolygon.

		// svg.appendChild(pl);

		// d3.selectAll('circle').data(data);

		// genmine();
	});

	let svg: SVGSVGElement;
	let svg2: SVGSVGElement;
	const width = 800;
	const height = 800;
</script>

<div class="meh">
	<!-- <svg id="chart" bind:this={svg} {width} {height} /> -->
	<!-- <svg id="chart2" bind:this={svg2} {width} {height} /> -->

	<!-- <Observe {data} {channels} /> -->
	<!-- <svg id="playground" /> -->
	<Scatter {data} {channels} />
</div>
