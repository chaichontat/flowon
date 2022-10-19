<script lang="ts">
	import Axis from '$src/components/axis.svelte';
	import Contours from '$src/components/contours.svelte';
	import Points from '$src/components/points.svelte';
	import * as d3 from 'd3';
	import { onMount, setContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import colors from 'tailwindcss/colors';
	import Dropdown from './dropdown.svelte';

	export let data: Record<string, number>[];
	export let channels: string[];
	export let storeSelect: Writable<[[number, number], [number, number]] | undefined>;

	export const width = 400;
	export const height = 400;
	const padding = { top: 20, right: 20, bottom: 20, left: 60 };
	setContext('params', { width, height, padding });

	let svg: SVGSVGElement;
	let xScale: d3.ScaleLinear<number, number>;
	let yScale: d3.ScaleLinear<number, number>;
	let x = channels[0];
	let y = channels[0];

	export let selected = [];

	const brush = d3.brush().on('start brush end', ({ selection }) => {
		const points = d3.select(svg).selectAll('circle');
		points.each((d) => (d.selected = false));
		selected.length = 0;
		if (selection) search(selection);
		points.classed('point--selected', (d) => d.selected);
	});

	let quadtree: d3.Quadtree<[number, number]>;
	onMount(() => {
		setTimeout(() => {
			y = channels[0];
			x = channels[1];
		}, 50);

		d3.select(svg).call(brush);
	});

	function search([[xmin, ymax], [xmax, ymin]]) {
		if (!quadtree) return;
		xmin = xScale.invert(xmin);
		xmax = xScale.invert(xmax);
		ymin = yScale.invert(ymin);
		ymax = yScale.invert(ymax);

		console.log(xmin, xmax, ymin, ymax);

		quadtree.visit((node, x1, y1, x2, y2) => {
			if (!node.length) {
				do {
					let d = node.data;
					d.selected = d[x] >= xmin && d[x] < xmax && d[y] >= ymin && d[y] < ymax;
					if (d.selected) selected.push(d);
				} while ((node = node.next));
			}
			return x1 >= xmax || y1 >= ymax || x2 < xmin || y2 < ymin;
		});
	}

	$: if (svg) {
		const isLog = (v?: string) => !v?.includes('FSC') && !v?.includes('SSC');
		const extent = [
			[isLog(x) ? 1 : 0, 262144],
			[isLog(y) ? 1 : 0, 262144]
		];

		quadtree = d3
			.quadtree()
			.extent([
				[-1, -1],
				[262144, 262144]
			])
			.x((d) => d[x])
			.y((d) => d[y])
			.addAll(data);

		const x_ = isLog(x) ? d3.scaleLog() : d3.scaleLinear();
		const y_ = isLog(y) ? d3.scaleLog() : d3.scaleLinear();
		xScale = x_
			.domain(extent[0])
			.range([padding.left, width - padding.right])
			.clamp(true)
			.nice();
		yScale = y_
			.domain(extent[1])
			.range([height - padding.bottom, padding.top])
			.clamp(true)
			.nice();
	}
	// const scales = { xScale, yScale };
	// const scales = genmine(svg, data, x, y, width, height);
</script>

<section>
	<Dropdown {channels} bind:curr={y} />
	<div class="flex items-end">
		<svg bind:this={svg} {width} {height}>
			<Points {data} {x} {y} {xScale} {yScale} />
			<!-- <Contours {data} {x} {y} {xScale} {yScale} /> -->
			<Axis axis="left" scale={yScale} />
			<Axis axis="bottom" scale={xScale} />
		</svg>
		<!-- <canvas class="border" bind:this={canvas} {width} {height} /> -->
		<Dropdown {channels} bind:curr={x} />
	</div>
</section>

<style lang="postcss">
	svg :global(.point--selected) {
		fill: red;
	}
</style>
