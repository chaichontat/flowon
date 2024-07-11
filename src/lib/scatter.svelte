<script lang="ts">
	import Axis from '$src/components/axis.svelte';
	import Canvas from '$src/components/canvas.svelte';
	import Contours from '$src/components/contours.svelte';
	import * as d3 from 'd3';
	import { throttle } from 'lodash-es';
	import { onMount, setContext } from 'svelte';
	import type { Writable } from 'svelte/store';
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
	let x = {chan: channels[0], isLog: false};
	let y = {chan: channels[1], isLog: false};


	export let selected = [];

	const processBrush = throttle((selection: [[number, number], [number, number]]) => {
		const points = d3.select(svg).selectAll('circle');
		points.each((d) => (d.selected = false));
		selected.length = 0;
		if (selection) search(selection);
	}, 30);

	const brush = d3
		.brush()
		.on('start brush end', ({ selection }) => processBrush(selection))
		.extent([
			[padding.left, padding.top],
			[width - padding.right, height - padding.bottom]
		]);

	let quadtree: d3.Quadtree<[number, number]>;
	onMount(() => {
		d3.select(svg).call(brush);
	});

	function search([[xmin, ymax], [xmax, ymin]]) {
		selected.length = 0;
		if (!quadtree) return;
		xmin = xScale.invert(xmin);
		xmax = xScale.invert(xmax);
		ymin = yScale.invert(ymin);
		ymax = yScale.invert(ymax);

		quadtree.visit((node, x1, y1, x2, y2) => {
			if (!node.length) {
				do {
					let d = node.data;
					// d.selected =
					if (d[x.chan] >= xmin && d[x.chan] < xmax && d[y.chan] >= ymin && d[y.chan] < ymax) selected.push(d.idx);
				} while ((node = node.next));
			}
			return x1 >= xmax || y1 >= ymax || x2 < xmin || y2 < ymin;
		});
		selected = selected
	}


	function updateScales(x: {chan:string, isLog: boolean}, y: {chan:string, isLog: boolean}) {
		const extent = [
			[x.isLog ? 1 : 0, 262144],
			[y.isLog ? 1 : 0, 262144]
		];

		quadtree = d3
			.quadtree()
			.extent(extent)
			.x((d) => d[x.chan])
			.y((d) => d[y.chan])
			.addAll(data);

		const x_ = x.isLog ? d3.scaleLog() : d3.scaleLinear();
		const y_ = y.isLog ? d3.scaleLog() : d3.scaleLinear();
		const xs = x_
			.domain(extent[0])
			.range([padding.left, width - padding.right])
			.clamp(true);
		xs.type = x.isLog ? 'log' : 'linear';

		const ys = y_
			.domain(extent[1])
			.range([height - padding.bottom, padding.top])
			.clamp(true);
		ys.type = y.isLog ? 'log' : 'linear';

		console.log(xs.domain(), ys.range());
		return {xScale: xs, yScale: ys};
	}

	$: if (svg) {
		({xScale, yScale} = updateScales(x, y));
		console.log("updateScales", xScale, yScale);
	}
	// const scales = { xScale, yScale };
	// const scales = genmine(svg, data, x, y, width, height);
	let showContours = false;
</script>

<section>
	<Dropdown {channels} bind:curr={y.chan} bind:isLog={y.isLog} />
	<label>
		<input type="checkbox" bind:checked={showContours} />
		<span class="pointer-events-none">Show Contours </span>
	</label>
	<div class="relative flex items-end">
		<div class="relative">
			<svg class="absolute" bind:this={svg} {width} {height}>
				<!-- <Points {data} {x} {y} {xScale} {yScale} /> -->
				{#if showContours}
					<Contours {data} x={x.chan} y={y.chan} {xScale} {yScale} />
				{/if}
				<Axis axis="left" scale={yScale} />
				<Axis axis="bottom" scale={xScale} />
			</svg>
			{#if xScale && yScale}
				<Canvas {data} x={{chan:x.chan, scale:xScale}} y={{chan:y.chan, scale:yScale}} />
			{/if}
		</div>
		<Dropdown {channels} bind:curr={x.chan} bind:isLog={x.isLog} />
	</div>
</section>

<style lang="postcss">
	svg :global(.point--selected) {
		fill: red;
	}
</style>
