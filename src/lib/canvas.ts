import * as d3 from 'd3';

const duration = 500;
const ease = d3.easeCubic;
let oldY = '';
let oldX = '';

export function draw(
	d: typeof data,
	scales?: { xScale: d3.ScaleLinear<number, number>; yScale: d3.ScaleLinear<number, number> }
) {
	const ctx = canvas.getContext('2d')!;
	ctx.save();
	// erase what is on the canvas currently
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = colors.sky[500];

	d.forEach((dd) => {
		const p = [scales?.xScale(dd[x]) ?? dd[x], scales?.yScale(dd[y]) ?? dd[y]];
		ctx.moveTo(p[0], p[1]);
		// ctx.fillRect(p[0], p[1], 1, 1);
		ctx.arc(p[0], p[1], 1, 0, 2 * Math.PI);
		// ctx.stroke();
		// ctx.fill();
		// ctx.arc(xScale(dd[x]), yScale(dd[y]), 1, 0, 2 * Math.PI);
	});
	ctx.fill();
	// ctx.scale(1 / 3, 1 / 3);
	ctx.restore();
}

export function setDPI(canvas, scaleFactor: number) {
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

export function transition() {
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
			setDPI(4);

			// if this animation is over
			if (t === 1) timer.stop();
		}, 1);
		console.log(interpolator(0.5));
	}
	oldX = x;
	oldY = y;
}
