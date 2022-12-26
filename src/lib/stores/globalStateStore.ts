import { get, writable } from 'svelte/store';
import { selectTool, pencilTool, panTool } from '$lib/components/tools';
import { setCursor } from '$lib/util/cursor';

// define tools
export type TTool = 'select' | 'pencil' | 'pan';
const tools: Record<TTool, { tool: paper.Tool; cursor: string }> = {
	select: {
		tool: selectTool,
		cursor: 'default'
	},
	pencil: {
		tool: pencilTool,
		cursor: 'crosshair'
	},
	pan: {
		tool: panTool,
		cursor: 'grab'
	}
};

/* Current Tool */
export const currentTool = writable<TTool>('select');
export const setCurrentTool = (target: TTool) => {
	const prevTool = get(currentTool);
	const { tool, cursor } = tools[target];
	currentTool.set(target);
    tool.activate();
	setCursor(cursor);

	return prevTool;
};

export const getCurrentTool = () => {
    return get(currentTool);
}