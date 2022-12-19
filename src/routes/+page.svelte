<script lang="ts">
	import { onMount } from 'svelte';
	import paper, { Color, Path, Point, Size } from 'paper';
	import type { PageParentData } from './$types';

	let canvas: HTMLCanvasElement;
	let wrapper: HTMLDivElement;
	let path: paper.Path;
	let isDrawing = false;
	let pan = { x: 0, y: 0 };
	let zoom = 1;

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
    /* 
        changeZoom: (oldZoom, delta, c, p) ->
      newZoom = super oldZoom, delta
      beta = oldZoom / newZoom
      pc = p.subtract c
      a = p.subtract(pc.multiply(beta)).subtract c
      [newZoom, a]
    */
   function changeZoom(oldZoom: number, delta: number, center: paper.Point, point: paper.Point): [number, paper.Point] {
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

	/*
    if event.shiftKey
        view.center = panAndZoom.changeCenter view.center, event.deltaX, event.deltaY, event.deltaFactor
        event.preventDefault()
    else if event.altKey
        mousePosition = new paper.Point event.offsetX, event.offsetY
        viewPosition = view.viewToProject(mousePosition)
        [newZoom, offset] = panAndZoom.changeZoom view.zoom, event.deltaY, view.center, viewPosition
        view.zoom = newZoom
        view.center = view.center.add offset
        event.preventDefault()
        view.draw()
    */
	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		event.stopPropagation();

        if (event.altKey) {
            const mousePosition = new Point(event.offsetX, event.offsetY);
            const viewPosition = paper.view.viewToProject(mousePosition);
            const [newZoom, offset] = changeZoom(paper.view.zoom, event.deltaY * 0.01, paper.view.center, viewPosition);

            // prevent flipping
            if (newZoom < 0.1) return;

            paper.view.zoom = newZoom;
            paper.view.center = paper.view.center.add(offset);
        } else if (event.shiftKey) {
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
	canvas {
		touch-action: none;
		-webkit-touch-callout: none;
		/* iOS Safari */
		-webkit-user-select: none;
		/* Safari */
		-khtml-user-select: none;
		/* Konqueror HTML */
		-moz-user-select: none;
		/* Old versions of Firefox */
		-ms-user-select: none;
		/* Internet Explorer/Edge */
		user-select: none;
		/* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
	}
</style>
