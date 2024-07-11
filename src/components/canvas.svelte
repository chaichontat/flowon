<script lang="ts">
	import { browser } from '$app/environment';
	import { runkde } from '$src/lib/kde';
	import * as d3 from 'd3';
	import { throttle } from 'lodash-es';
	import { getContext, onMount } from 'svelte';
	import colors from 'tailwindcss/colors';

	let canvas: HTMLCanvasElement;
	export let data: Record<string, number>[];
	export let x: {chan:string, scale: d3.ScaleLinear<number, number>};
	export let y: {chan:string, scale: d3.ScaleLinear<number, number>};
	let fills = [];

	const { width, height, padding } = getContext('params') as {
		width: number;
		height: number;
		padding: { top: number; right: number; bottom: number; left: number };
	};

	export function draw(
		d: Record<string, number>[],
		x: string,
		y: string,
		scales?: { xScale: d3.ScaleLinear<number, number>; yScale: d3.ScaleLinear<number, number> },
		fill?: string[]
	) {
		// if (!offscreenCanvas || !worker) return;

		// const toSendScale = scales
		// 	? [
		// 			{
		// 				type: scales.xScale.type,
		// 				domain: scales.xScale.domain(),
		// 				range: scales.xScale.range()
		// 			},
		// 			{ type: scales.yScale.type, domain: scales.yScale.domain(), range: scales.yScale.range() }
		// 	  ]
		// 	: null;

		// worker.postMessage({
		// 	data: d,
		// 	x,
		// 	y,
		// 	width,
		// 	height,
		// 	padding,
		// 	scales: toSendScale,
		// 	fills: fill
		// });

		// return;
		if (!canvas) {
			throw new Error("canvas is not defined");
		};

		if (!d) {
			throw new Error("data is not defined");
		};

		const ctx = canvas.getContext('2d')!;
		ctx.save();

		// erase what is on the canvas currently
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = colors.sky[500];

		for (const [i, dd] of d.entries()) {
			const p = [
				Math.floor(scales?.xScale(dd[x]) ?? dd[x]),
				Math.floor(scales?.yScale(dd[y]) ?? dd[y])
			];
			ctx.beginPath();
			ctx.fillStyle = fill ? fill[i] : colors.sky[500];
			ctx.moveTo(p[0], p[1]);
			// ctx.fillRect(p[0], p[1], 1, 1);
			ctx.arc(p[0], p[1], 0.5, 0, 2 * Math.PI);
			ctx.fill();
			ctx.closePath();
		}
		// ctx.scale(1 / 3, 1 / 3);
		ctx.restore();

		setDPI(3);
	}

	export function setDPI(scaleFactor: number) {
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

	let oldY = undefined as { chan: string; yScale: d3.ScaleLinear<number, number> } | undefined;
	let oldX = undefined as { chan: string; xScale: d3.ScaleLinear<number, number> } | undefined;
	let oldFills = undefined as string[] | undefined;

	export function transition(x: {chan:string, scale: d3.ScaleLinear<number, number>}, y: {chan:string, scale: d3.ScaleLinear<number, number>}) {
		if (!canvas) return
		// const toSendScale = [
		// 	{
		// 		type: xScale.type,
		// 		domain: xScale.domain(),
		// 		range: xScale.range()
		// 	},
		// 	{ type: yScale.type, domain: yScale.domain(), range: yScale.range() }
		// ];

		// worker.postMessage({
		// 	data,
		// 	x,
		// 	y,
		// 	width,
		// 	height,
		// 	padding,
		// 	scales: toSendScale,
		// 	fills,
		// 	transition: true
		// });

		// return;

		const duration = 500;
		const ease = d3.easeCubic;

		let go = (oldX?.chan !== x.chan || oldY?.chan !== y.chan || oldX?.scale?.type !== x.scale.type || oldY?.scale?.type !== y.scale.type);

		console.log(x.scale.type, y.scale.type);


		if (oldX?.xScale && oldY?.yScale && oldFills && go) {
			console.log("transition")
			// console.log(oldX.x, x, oldY.y, y);
			// console.log('transition', x, y);
			const source = data.map((d) => ({
				x: oldX!.xScale(d[oldX!.chan]),
				y: oldY!.yScale(d[oldY!.chan])
			}));
			const dest = data.map((d) => ({
				x: x.scale(d[x.chan]),
				y: y.scale(d[y.chan])
			}));
			const interpolator = d3.interpolateArray(source, dest);
			const cint = d3.interpolateArray(oldFills, fills);
			const timer = d3.timer(
				throttle((elapsed: number) => {
					// compute how far through the animation we are (0 to 1)
					const t = Math.min(1, ease(elapsed / duration));
					draw(interpolator(t), "x", "y", undefined, cint(t));
					// if this animation is over
					if (t === 1) timer.stop();
				}, 20)
			);
		}
		oldX = { chan:x.chan, xScale: x.scale?.copy() };
		oldY = { chan:y.chan, yScale: y.scale?.copy() };
		oldFills = fills;
	}
	let worker: Worker | undefined = undefined;
	let offscreenCanvas: HTMLCanvasElement | undefined = undefined;

	onMount(() => {
		// worker = new Worker(new URL('./canvasoffscreen.js', import.meta.url));
		// offscreenCanvas = canvas.transferControlToOffscreen();
		// console.log(offscreenCanvas);
		// worker.postMessage({ offscreenCanvas }, [offscreenCanvas]);
		// worker.addEventListener('message', (e) => {
		// 	console.log('message', e);
		// });
		fills = x.scale ? runkde(data, x, y, x.scale, y.scale)?.map(d3.interpolateTurbo) : [];
		draw(data, x.chan, y.chan, { xScale: x.scale, yScale: y.scale }, fills);
	});

	$: fills = x.scale ? runkde(data, x.chan, y.chan, x.scale, y.scale)?.map(d3.interpolateTurbo) : [];
	$: transition(x, y);
</script>

<canvas bind:this={canvas} {height} {width} />
