import { useCallback, useEffect, useRef } from 'react';
import type { WheelEvent } from 'react';
import paper, { Point, Size } from 'paper';
import { setCurrentTool, getCurrentTool, type TTool } from '$lib/stores/globalStateStore';
import { canvasRef as globalCanvasRef } from '$lib/stores/globalRefsStateStore';
import { shiftKeyPressed } from '$lib/stores/keyboardStateStore';
import { drawHighlight } from '$lib/stores/layerStateStore';

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
	const offset = point.subtract(pc.multiply(beta)).subtract(center);

	drawHighlight();

	return [newZoom, offset];
}

function changeCenter(oldCenter: paper.Point, deltaX: number, deltaY: number, factor: number) {
	let offset = new Point(deltaX, deltaY);
	offset = offset.multiply(factor);
	return oldCenter.add(offset);
}

const Canvas = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const previousToolRef = useRef<TTool | null>(null);
	const isSpaceKeyPressedRef = useRef(false);

	const setCanvasSize = useCallback(() => {
		const canvas = canvasRef.current;
		const wrapper = wrapperRef.current;
		if (!canvas || !wrapper || !paper.view) return;

		const { width, height } = wrapper.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;
		paper.view.viewSize = new Size(width, height);
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		globalCanvasRef.set(canvas);
		paper.setup(canvas);
		setCanvasSize();
		setCurrentTool(getCurrentTool());

		const handleResize = () => setCanvasSize();
		const handleKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			const isTyping =
				target?.tagName === 'INPUT' ||
				target?.tagName === 'TEXTAREA' ||
				target?.tagName === 'SELECT' ||
				target?.isContentEditable;

			if (event.key === 'Shift') {
				shiftKeyPressed.set(true);
			} else if (isTyping) {
				return;
			} else if (event.key === ' ') {
				event.preventDefault();
				if (!isSpaceKeyPressedRef.current) {
					previousToolRef.current = setCurrentTool('pan');
					isSpaceKeyPressedRef.current = true;
				}
			} else if (event.key === 'v' || event.key === 'a') {
				setCurrentTool('select');
			} else if (event.key === 'p') {
				setCurrentTool('pencil');
			} else if (event.key === 'r') {
				setCurrentTool('rectangle');
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === 'Shift') {
				shiftKeyPressed.set(false);
			} else if (event.key === ' ') {
				isSpaceKeyPressedRef.current = false;
				if (previousToolRef.current) {
					setCurrentTool(previousToolRef.current);
				}
			}
		};

		window.addEventListener('resize', handleResize);
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			globalCanvasRef.set(null);
		};
	}, [setCanvasSize]);

	const handleWheel = useCallback((event: WheelEvent<HTMLCanvasElement>) => {
		event.preventDefault();
		event.stopPropagation();

		if (event.ctrlKey || event.metaKey) {
			const mousePosition = new Point(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
			const viewPosition = paper.view.viewToProject(mousePosition);
			const [newZoom, offset] = changeZoom(
				paper.view.zoom,
				-event.deltaY * 0.01,
				paper.view.center,
				viewPosition
			);

			if (newZoom < MIN_ZOOM || newZoom > MAX_ZOOM) return;

			paper.view.zoom = newZoom;
			paper.view.center = paper.view.center.add(offset);
		} else {
			paper.view.center = changeCenter(paper.view.center, event.deltaX, event.deltaY, 1.0);
		}
	}, []);

	return (
		<div ref={wrapperRef} className="canvas-wrapper">
			<canvas ref={canvasRef} id="my-canvas" onWheel={handleWheel} />
		</div>
	);
};

export default Canvas;
