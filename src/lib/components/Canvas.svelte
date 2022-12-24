<script lang="ts">
	import { onMount } from 'svelte';
	import paper, { Point, Size } from 'paper';
	import { shiftKeyPressed } from '$lib/stores/keyboardStateStore';

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
		return [newZoom, a];
	}

	function changeCenter(oldCenter: paper.Point, deltaX: number, deltaY: number, factor: number) {
		let offset = new Point(deltaX, deltaY);
		offset = offset.multiply(factor);
		return oldCenter.add(offset);
	}

	onMount(() => {
		canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
		paper.setup(canvas);
		setCanvasSize();
		window.addEventListener('resize', setCanvasSize);

		window.addEventListener('keydown', (event) => {
			if (event.key === 'Shift') {
				shiftKeyPressed.set(true);
			}
		});

		window.addEventListener('keyup', (event) => {
			if (event.key === 'Shift') {
				shiftKeyPressed.set(false);
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

<div id="wrapper">
	<canvas id="my-canvas" on:resize={setCanvasSize} on:wheel={handleWheel} />
</div>

<style>
    #wrapper {
        flex: 1;
		position: relative; 
    }
</style>