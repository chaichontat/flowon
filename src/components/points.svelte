<script lang="ts">
	import * as d3 from 'd3';

	export let data: Record<string, number>[];
	export let x = '';
	export let y = '';
	export let xScale: d3.ScaleLinear<number, number>;
	export let yScale: d3.ScaleLinear<number, number>;

	let g: SVGGElement;

	function genmine(data: Record<string, number>[], x: string, y: string) {
		if (!x || !y) return;

		const s = d3.select(g);
		const t = s.transition().duration(750);

		const toUpdate = s.selectAll('circle').data(data, (d) => d.idx);

		toUpdate
			.transition()
			.ease(d3.easeCubicInOut)
			.duration(400)
			.attr('cx', (d) => xScale(d[x]))
			.attr('cy', (d) => yScale(d[y]));

		toUpdate
			.enter()
			.append('circle')
			.attr('r', 1)
			.attr('opacity', 0.3)
			.attr('cx', (d) => xScale(d[x]))
			.attr('cy', (d) => yScale(d[y]));

		toUpdate.exit().remove();
	}

	$: if (g) genmine(data, x, y);
</script>

<g bind:this={g} />

<style lang="postcss">
	g :global(circle) {
		fill: blue;
	}
</style>
