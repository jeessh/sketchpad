import { canvasRef } from '$lib/stores/globalRefsStateStore';

let canvas: HTMLCanvasElement | null = null;
canvasRef.subscribe((value) => {
    canvas = value;
});

export const setCursor = (cursor: string) => {
    if (canvas) {
        canvas.style.cursor = cursor;
    }
}