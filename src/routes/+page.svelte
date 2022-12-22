<script lang="ts">
	import { onMount } from 'svelte';
	import paper, { Color, Path, Point, Size } from 'paper';
	import type { PageParentData } from './$types';

	let canvas: HTMLCanvasElement;
	let wrapper: HTMLDivElement;
	let path: paper.Path;
	let isDrawing = false;

	let MIN_ZOOM = 0.1;
	let MAX_ZOOM = 10.0;

	let startX = 0;
	let startY = 0;
	let posX = 0;
	let posY = 0;
	let gestureStartScale = 1.0;
	let scale = 1.0;

	onMount(() => {
		canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
		paper.setup(canvas);
		setCanvasSize();
		window.addEventListener('resize', setCanvasSize);
	});

	function setCanvasSize() {
		wrapper = document.getElementById('wrapper') as HTMLDivElement;
		canvas.width = wrapper.getBoundingClientRect().width;
		canvas.height = wrapper.getBoundingClientRect().height;
		paper.view.viewSize = new Size(canvas.width, canvas.height);
	}

	function startDrawing(event: MouseEvent) {
		isDrawing = true;
		const point = paper.view.viewToProject(new Point(event.offsetX, event.offsetY));

		path = new Path();
		path.strokeWidth = 2;
		path.strokeCap = 'round';
		path.strokeColor = new Color('black');
		path.add(point);
	}

	function continueDrawing(event: MouseEvent) {
		if (isDrawing) {
			const point = paper.view.viewToProject(new Point(event.offsetX, event.offsetY));
			path.add(point);
		}
	}

	function stopDrawing() {
		isDrawing = false;
	}
    
	function changeZoom(
		oldZoom: number,
		delta: number,
		center: paper.Point,
		point: paper.Point
	): [number, paper.Point] {
		const newZoom = oldZoom + delta;
		const beta = oldZoom / newZoom;
		const pc = point.subtract(center);
		const a = point.subtract(pc.multiply(beta)).subtract(center);
		return [newZoom, a];
	}

	function changeCenter(oldCenter: paper.Point, deltaX: number, deltaY: number, factor: number) {
		let offset = new Point(deltaX, deltaY);
		offset = offset.multiply(factor);
		return oldCenter.add(offset);
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		event.stopPropagation();

		if (event.ctrlKey) {
			const mousePosition = new Point(event.offsetX, event.offsetY);
			const viewPosition = paper.view.viewToProject(mousePosition);
			const [newZoom, offset] = changeZoom(
				paper.view.zoom,
				-event.deltaY * 0.01,
				paper.view.center,
				viewPosition
			);

			// prevent flipping
			if (newZoom < MIN_ZOOM || newZoom > MAX_ZOOM) return;

			paper.view.zoom = newZoom;
			paper.view.center = paper.view.center.add(offset);
		} else {
			// get delta fector
			paper.view.center = changeCenter(paper.view.center, event.deltaX, event.deltaY, 1.0);
		}
	}
</script>

<div id="root">
	<div class="toolbar">
		<button on:click={() => paper.project.activeLayer.removeChildren()}>Clear</button>
	</div>
	<div id="wrapper" class="canvas-wrapper">
		<canvas
			id="my-canvas"
			on:resize={setCanvasSize}
			on:mousedown={startDrawing}
			on:mousemove={continueDrawing}
			on:mouseup={stopDrawing}
			on:wheel={handleWheel}
		/>
	</div>
</div>

<style>
	#root {
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
	}
	.canvas-wrapper {
		flex: 1;
		position: relative;
	}
</style>
