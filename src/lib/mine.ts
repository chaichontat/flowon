/* eslint-disable no-return-assign */
import * as d3 from 'd3';
import parseFCS from './fcs';

export function processFCS(buf: ArrayBuffer) {
	const fcs = parseFCS(buf);

	console.log(fcs);

	const channels = fcs.parameters.map((x, i) => x[`$P${i + 1}N`]) as string[];
	const data = fcs.data.map((x) => {
		const obj: Record<string, number> = {};
		channels.forEach((y, i) => (obj[y] = x[i]));
		return obj;
	});
	return { data, channels, text: fcs.text };
}

export function genmine(
	svg: SVGSVGElement,
	data: Record<string, number>[],
	x: string,
	y: string,
	width = 600,
	height = 600
) {
	if (!svg || !x || !y) return;
	const extent = [
		[0, x.includes('FSC') || x.includes('SSC') ? 262144 : d3.max(data, (d) => d[x])],
		[0, y.includes('FSC') || y.includes('SSC') ? 262144 : d3.max(data, (d) => d[y] + 1)]
	];

	const xScale = d3.scaleLinear().domain(extent[0]).range([0, width]);
	const yScale = d3.scaleLinear().domain(extent[1]).range([height, 0]);

	const s = d3.select(svg);
	const t = s.transition().duration(750);

	const toUpdate = s.selectAll('circle').data(data);

	toUpdate
		.transition()
		.ease(d3.easeCubicInOut)
		.duration(400)
		.attr('cx', (d) => xScale(d[x]))
		.attr('cy', (d) => yScale(d[y]));

	toUpdate
		.enter()
		.append('circle')
		.attr('fill', 'steelblue')
		.attr('r', 1)
		.attr('opacity', 0.3)
		.call((u) => u.transition(t))
		.attr('cx', (d) => xScale(d[x]))
		.attr('cy', (d) => yScale(d[y]));

	toUpdate
		.exit()
		.call((u) => u.transition(t))
		.attr('cy', 0)
		.remove();

	return { xScale, yScale };
}

export function genContour(svg, data, color) {
	const contours = d3
		.contourDensity()
		.x((d) => d[x])
		.y((d) => d[y])
		.size([width, height])
		.bandwidth(bandwidth)(data);

	svg
		.append('g')
		.attr('fill', 'none')
		.attr('stroke', '#fff')
		.attr('stroke-opacity', 0.5)
		.selectAll('path')
		.data(contours)
		.join('path')
		.attr('fill', (d) => color(d.value))
		.attr('d', d3.geoPath());
}
