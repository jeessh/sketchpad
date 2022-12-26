<script lang="ts">
	import { onMount } from 'svelte';
	import paper, { Point, Size } from 'paper';
	import { shiftKeyPressed } from '$lib/stores/keyboardStateStore';
	import { setCurrentTool, getCurrentTool, type TTool } from '$lib/stores/globalStateStore';
	import { canvasRef } from '$lib/stores/globalRefsStateStore';
	import { drawHighlight } from '$lib/util/selection';

	let canvas: HTMLCanvasElement;
	let wrapper: HTMLDivElement;

	const MIN_ZOOM = 0.1;
	const MAX_ZOOM = 10.0;

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

		drawHighlight();

		return [newZoom, a];
	}

	function changeCenter(oldCenter: paper.Point, deltaX: number, deltaY: number, factor: number) {
		let offset = new Point(deltaX, deltaY);
		offset = offset.multiply(factor);
		return oldCenter.add(offset);
	}

	let prevTool: TTool | null = null;
	let isSpaceKeyPressed = false;

	onMount(() => {
		canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
		canvasRef.set(canvas);
		paper.setup(canvas);
		setCanvasSize();
		window.addEventListener('resize', setCanvasSize);

		window.addEventListener('keydown', (event) => {
			if (event.key === 'Shift') {
				shiftKeyPressed.set(true);
			} else if (event.key === ' ') {
				if (!isSpaceKeyPressed) {
					// change to pan tool
					prevTool = setCurrentTool('pan');
					isSpaceKeyPressed = true;
				}
			} else if (event.key == 'v' || event.key == 'a') {
				setCurrentTool('select');
			} else if (event.key == 'p') {
				setCurrentTool('pencil');
			}
		});

		window.addEventListener('keyup', (event) => {
			if (event.key === 'Shift') {
				shiftKeyPressed.set(false);
			} else if (event.key === ' ') {
				isSpaceKeyPressed = false;
				// change back to previous tool
				if (prevTool) {
					setCurrentTool(prevTool);
				}
			}
		});
	});

	function setCanvasSize() {
		wrapper = document.getElementById('wrapper') as HTMLDivElement;
		canvas.width = wrapper.getBoundingClientRect().width;
		canvas.height = wrapper.getBoundingClientRect().height;
		paper.view.viewSize = new Size(canvas.width, canvas.height);
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		event.stopPropagation();

		if (event.ctrlKey || event.metaKey) {
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

<div id="wrapper">
	<canvas id="my-canvas" on:resize={setCanvasSize} on:wheel={handleWheel} />
</div>

<style>
    #wrapper {
		height: 100%;
        flex: 1;
		position: relative; 
    }
</style>