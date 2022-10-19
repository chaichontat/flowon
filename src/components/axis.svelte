<script lang="ts">
	import * as d3 from 'd3';
	import { getContext, onMount } from 'svelte';

	export let axis: 'left' | 'bottom';
	export let scale: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number>;
	let g: SVGGElement;

	let ax = axis === 'bottom' ? d3.axisBottom() : d3.axisLeft();

	const { padding } = getContext('params') as {
		width: number;
		height: number;
		padding: { top: number; right: number; bottom: number; left: number };
	};

	// onMount(() => {
	// 	setTimeout(() => {
	// 		d3.select(g)
	// 			.call(ax.ticks(5))
	// 			.call((h) => h.select('.domain').remove());
	// 	}, 60);
	// });

	$: if (g && ax && scale) {
		d3.select(g)
			.attr(
				'transform',
				axis === 'bottom'
					? `translate(0, ${scale.range()[1]})`
					: axis === 'left'
					? `translate(${padding.left}, 0)`
					: ''
			)
			.transition()
			.duration(300)
			.call(ax.scale(scale).ticks(5));
	}
</script>

<g bind:this={g} />
