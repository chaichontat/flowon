postMessage('Worker initialized.');

importScripts(
	'../../node_modules/d3-scale/dist/d3-scale.js',
	'../../node_modules/d3-color/dist/d3-color.js',
	'../../node_modules/d3-ease/dist/d3-ease.js',
	'../../node_modules/d3-timer/dist/d3-timer.js',
	'../../node_modules/d3-interpolate/dist/d3-interpolate.js'
);

/** @type {HTMLCanvasElement | null} */
let canvas = null;
/** @type {{ y: string; yScale: d3.ScaleLinear<number, number> } | undefined} */
let oldY = undefined;
/** @type {{ x: string; xScale: d3.ScaleLinear<number, number> } | undefined} */
let oldX = undefined;
/** @type {string[] | undefined} */
let oldFills = undefined;

/**
 * @param {number} scaleFactor
 **/
function setDPI(scaleFactor) {
	// Set up CSS size.
	canvas.style.width = canvas.style.width || canvas.width + 'px';
	canvas.style.height = canvas.style.height || canvas.height + 'px';

	// Get size information.
	const width = parseFloat(canvas.style.width);
	const height = parseFloat(canvas.style.height);

	// Backup the canvas contents.
	const oldScale = canvas.width / width;
	const backupScale = scaleFactor / oldScale;
	/** @type {HTMLCanvasElement} */
	const backup = canvas.cloneNode(false);
	backup.getContext('2d').drawImage(canvas, 0, 0);

	// Resize the canvas.
	/** @type {CanvasRenderingContext2D} */
	const ctx = canvas.getContext('2d');
	canvas.width = Math.ceil(width * scaleFactor);
	canvas.height = Math.ceil(height * scaleFactor);

	// Redraw the canvas image and scale future draws.
	ctx.setTransform(backupScale, 0, 0, backupScale, 0, 0);
	ctx.drawImage(backup, 0, 0);
	ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
}

/**
 * @param {Record<string, number>[]} d
 * @param {string} x
 * @param {string} y
 * @param {{ xScale: d3.ScaleLinear<number, number>; yScale: d3.ScaleLinear<number, number> }} scales
 * @param {string[]} fills
 * @param {number} width
 * @param {number} height
 */
function draw(d, x, y, scales, fills, width, height) {
	if (!canvas) return;

	/** @type {CanvasRenderingContext2D} */
	const ctx = canvas.getContext('2d');
	ctx.save();

	// erase what is on the canvas currently
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = 'black';

	d.forEach((dd, i) => {
		const p = [
			Math.floor(scales?.xScale(dd[x]) ?? dd[x]),
			Math.floor(scales?.yScale(dd[y]) ?? dd[y])
		];
		ctx.getImageData(p[0], p[1], 1, 1);
		ctx.beginPath();
		ctx.fillStyle = fills ? fills[i] : 'black';
		ctx.moveTo(p[0], p[1]);
		ctx.arc(p[0], p[1], 0.5, 0, 2 * Math.PI);
		ctx.fill();
		ctx.closePath();
	});

	// ctx.scale(1 / 3, 1 / 3);
	ctx.restore();
	// setDPI(canvas, 3);
}

function transit(data, fills, x, y, xScale, yScale, width, height) {
	const duration = 500;
	const ease = d3.easeCubic;

	if (oldX?.xScale && oldY?.yScale && oldFills && (oldX.x !== x || oldY.y !== y)) {
		console.log(oldX.x, x, oldY.y, y);

		console.log('transition', x, y);
		const source = data.map((d) => ({
			[x]: oldX.xScale(d[oldX.x]),
			[y]: oldY.yScale(d[oldY.y])
		}));
		const dest = data.map((d) => ({
			[x]: xScale(d[x]),
			[y]: yScale(d[y])
		}));
		const interpolator = d3.interpolateArray(source, dest);
		const cint = d3.interpolateArray(oldFills, fills);
		const timer = d3.timer((elapsed) => {
			// compute how far through the animation we are (0 to 1)
			const t = Math.min(1, ease(elapsed / duration));
			draw(interpolator(t), x, y, undefined, cint(t), width, height);
			// if this animation is over
			if (t === 1) timer.stop();
		});
	}
	oldX = { x, xScale: xScale?.copy() };
	oldY = { y, yScale: yScale?.copy() };
	oldFills = fills;
}

addEventListener(
	'message',
	({ data: { offscreenCanvas, data, x, y, scales, fills, width, height, transition } }) => {
		if (offscreenCanvas) {
			canvas = offscreenCanvas;
			postMessage('Canvas initialized.');
			return;
		}

		postMessage('Drawing...');
		const xScale = scales
			? (scales[0].type === 'log' ? d3.scaleLog() : d3.scaleLinear())
					.domain(scales[0].domain)
					.range(scales[0].range)
			: null;

		const yScale = scales
			? (scales[1].type === 'log' ? d3.scaleLog() : d3.scaleLinear())
					.domain(scales[1].domain)
					.range(scales[1].range)
			: null;

		if (transition) {
			transit(data, fills, x, y, xScale, yScale, width, height);
		} else {
			draw(data, x, y, scales ? { xScale, yScale } : null, fills, width, height);
		}
	}
);
