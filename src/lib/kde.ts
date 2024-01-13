import * as d3 from 'd3';
import { density2d } from 'fast-kde';

export function runkde(data, x, y, xScale: d3.ScaleLinear<number, number>, yScale, bin = 256) {
	if (!xScale || !yScale || !data.length || !data[0][x]) return;

	const kde = density2d(data, {
		x: (d) => xScale(d[x]),
		y: (d) => yScale(d[y]),
		extent: [xScale.range(), [yScale.range()[1], yScale.range()[0]]],
		// bandwidth: [1, 1],
		bins: [bin, bin]
	});

	const kdep = [...kde];

	// console.log(data.map((d) => yScale(Math.log10(Math.max(0, d[y]) + 1))));

	const max = 1 / d3.max(kdep, (d) => d.z);

	const xs = xScale
		.copy()
		.range([0, bin - 1])
		.interpolate(d3.interpolateRound);
	const ys = yScale
		.copy()
		.range([bin - 1, 0])
		.interpolate(d3.interpolateRound);

	return data.map((d) => {
		return kdep[ys(d[y]) * bin + xs(d[x])].z * max;
	});
}
