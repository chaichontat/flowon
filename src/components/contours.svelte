<script lang="ts">
	import * as d3 from 'd3';
	import { getContext } from 'svelte';
	let g: SVGGElement;

	export let data: Record<string, number>[];
	export let x = '';
	export let y = '';
	export let xScale: d3.ScaleLinear<number, number>;
	export let yScale: d3.ScaleLinear<number, number>;

	const { padding } = getContext('params');

	function update(xScale, yScale) {
		const contours = d3
			.contourDensity()
			.thresholds(20)
			.x((d) => xScale(d[x]))
			.y((d) => yScale(d[y]))
			.bandwidth(20);

		d3.select(g)
			.attr('fill', 'none')
			.attr('stroke', 'steelblue')
			.attr('stroke-linejoin', 'round')
			.selectAll('path')
			.data(contours(data))
			.join('path')
			.attr('stroke-width', (d, i) => (i % 5 ? 0.25 : 1))
			.transition()
			.delay(300)
			.duration(0)

			.attr('d', d3.geoPath());
	}

	$: if (g) update(xScale, yScale);
</script>

<g bind:this={g} />
