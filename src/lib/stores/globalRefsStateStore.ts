import { writable } from './simpleStore';

export const canvasRef = writable<HTMLCanvasElement | null>(null);
