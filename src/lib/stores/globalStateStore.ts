import { writable } from 'svelte/store';

export const canvasRef = writable<HTMLCanvasElement | null>(null);