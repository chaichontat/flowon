<script lang="ts">
	import * as d3 from 'd3';
	import { randomNormal } from 'd3';
	import { column, eigs, mean, multiply, subtract, transpose } from 'mathjs';
	import { onMount } from 'svelte';

	let svg: SVGSVGElement;
	const height = 500;
	const width = 500;
	const margins = { top: 20, right: 20, bottom: 20, left: 20 };

	let realData = [4, 8, 15, 16, 23, 42];

	function run() {
		const measurement = [1, 2, 3, 4, 5, 6, 7, 10, 15];
		const rand = randomNormal(0, 1);
		const use = measurement.map((d) => ({ x: d, y: Math.random() * d + rand() }));

		// const yy = [y(x[0]), y(x[1])];

		const mmax = Math.max(
			d3.max(use, (d) => d.x),
			d3.max(use, (d) => d.y)
		);
		const xScale = d3
			.scaleLinear()
			.domain([0, mmax])
			.range([margins.left, width - margins.right]);

		const yScale = d3
			.scaleLinear()
			.domain([0, mmax])
			.range([height - margins.bottom, margins.top]);

		const xAxis = d3.axisBottom(xScale);
		d3.select(svg)
			.append('g')
			.attr('transform', `translate(0, ${height - margins.bottom})`)
			.call(xAxis);

		const yAxis = d3.axisLeft(yScale);
		d3.select(svg).append('g').attr('transform', `translate(${margins.left}, 0)`).call(yAxis);

		d3.select(svg)
			.selectAll('circle')
			.data(use)
			.enter()
			.append('circle')
			.attr('cx', (d) => xScale(d.x))
			.attr('cy', (d) => yScale(d.y))
			.attr('r', 5)
			.attr('fill', 'red');

		const mat = use.map((d) => [d.x, d.y]);
		const means = mean(mat, 0);
		for (const m of mat) {
			m[0] -= means[0];
			m[1] -= means[1];
		}

		const cov = multiply(transpose(mat), mat);
		const { values, vectors } = eigs(cov, 1);
		console.log(values, vectors);

		const x = [means[0], means[0] + 5];
		const y = (x: number, i: number) => (vectors[1][i] / vectors[0][i]) * (x - means[0]) + means[1];
		d3.select(svg)
			.append('path')
			.attr(
				'd',
				d3
					.line()
					.x((d) => xScale(d))
					.y((d) => yScale(y(d, 0)))(x)
			)
			.attr('fill', 'none')
			.attr('stroke', 'red');

		d3.select(svg)
			.append('path')
			.attr(
				'd',
				d3
					.line()
					.x((d) => xScale(d))
					.y((d) => yScale(y(d, 1)))(x)
			)
			.attr('fill', 'none')
			.attr('stroke', 'black');
	}
	onMount(() => {
		run();
	});
</script>

Hi
<div class="">
	<svg bind:this={svg} {width} {height} />
</div>
