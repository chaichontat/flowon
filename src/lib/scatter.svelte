<script lang="ts">
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import Dropdown from './dropdown.svelte';
	import { genmine } from './mine';
	import { what } from './what';

	export let data: Record<string, number>[];
	export let channels: string[];
	export const width = 400;
	export const height = 400;

	let svg: SVGSVGElement;
	let canvas: HTMLCanvasElement;
	let x = channels[0];
	let y = channels[0];

	// draw the points based on their current layout
	function draw(
		d: typeof data,
		scales?: { xScale: d3.ScaleLinear<number, number>; yScale: d3.ScaleLinear<number, number> }
	) {
		const ctx = canvas.getContext('2d')!;
		ctx.save();
		// erase what is on the canvas currently
		ctx.clearRect(0, 0, width, height);
		d.forEach((dd) => {
			ctx.fillStyle = 'black';
			scales
				? ctx.fillRect(scales.xScale(dd[x] * 3), scales.yScale(dd[y] * 3), 1, 1)
				: ctx.fillRect(dd[x], dd[y], 1, 1);
			// ctx.arc(xScale(dd[x]), yScale(dd[y]), 1, 0, 2 * Math.PI);
		});
		// ctx.scale(1 / 3, 1 / 3);
		ctx.restore();
	}

	const duration = 500;
	const ease = d3.easeCubic;
	let oldY = '';
	let oldX = '';
	onMount(() => {
		setTimeout(() => {
			y = channels[0];
			x = channels[1];
		}, 50);
	});

	function setDPI(scaleFactor: number) {
		// Set up CSS size.
		canvas.style.width = canvas.style.width || canvas.width + 'px';
		canvas.style.height = canvas.style.height || canvas.height + 'px';

		// Get size information.
		const width = parseFloat(canvas.style.width);
		const height = parseFloat(canvas.style.height);

		// Backup the canvas contents.
		const oldScale = canvas.width / width;
		const backupScale = scaleFactor / oldScale;
		const backup = canvas.cloneNode(false) as HTMLCanvasElement;
		backup.getContext('2d')!.drawImage(canvas, 0, 0);

		// Resize the canvas.
		const ctx = canvas.getContext('2d')!;
		canvas.width = Math.ceil(width * scaleFactor);
		canvas.height = Math.ceil(height * scaleFactor);

		// Redraw the canvas image and scale future draws.
		ctx.setTransform(backupScale, 0, 0, backupScale, 0, 0);
		ctx.drawImage(backup, 0, 0);
		ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
	}

	$: if (svg) {
		const extent = [
			[0, x?.includes('FSC') || x?.includes('SSC') ? 262144 : d3.max(data, (d) => d[x])],
			[0, y?.includes('FSC') || y?.includes('SSC') ? 262144 : d3.max(data, (d) => d[y] + 1)]
		];

		const xScale = d3.scaleLinear().domain(extent[0]).range([0, width]);
		const yScale = d3.scaleLinear().domain(extent[1]).range([height, 0]);
		const scales = { xScale, yScale };
		// const scales = genmine(svg, data, x, y, width, height);
		if (scales) {
			if (oldX && oldY && (oldX !== x || oldY !== y)) {
				const source = data.map((d) => ({
					[x]: scales.xScale(d[oldX]),
					[y]: scales.yScale(d[oldY])
				}));
				const dest = data.map((d) => ({
					[x]: scales.xScale(d[x]),
					[y]: scales.yScale(d[y])
				}));
				const interpolator = d3.interpolateArray(source, dest);
				const timer = d3.timer((elapsed: number) => {
					// compute how far through the animation we are (0 to 1)
					const t = Math.min(1, ease(elapsed / duration));
					draw(interpolator(t));
					setDPI(3);

					// if this animation is over
					if (t === 1) timer.stop();
				}, 1);
				console.log(interpolator(0.5));
			}
			oldX = x;
			oldY = y;
		}
	}

	// onMount(async () => {
	// 	await genmine(svg, data);
	// });
</script>

<Dropdown {channels} bind:curr={y} />
<div>
	<svg bind:this={svg} {width} {height} />
	<canvas class="border" bind:this={canvas} {width} {height} />
	<Dropdown {channels} bind:curr={x} />
</div>
