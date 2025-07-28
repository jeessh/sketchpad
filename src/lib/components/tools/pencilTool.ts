import paper, { Color, Path } from 'paper';
import { createLayerForNewElement } from '$lib/stores/layerManagerStore';

let path: paper.Path;
let isDrawing = false;

const tool = new paper.Tool();

tool.onMouseDown = (event: paper.ToolEvent) => {
	isDrawing = true;
	
	// Create a new layer for this path before drawing
	createLayerForNewElement('Path');

	path = new Path();
	path.strokeWidth = 2;
	path.strokeCap = 'round';
	path.strokeColor = new Color('black');
	path.add(event.point);
};

tool.onMouseMove = (event: paper.ToolEvent) => {
	if (isDrawing) {
		path.add(event.point);
	}
};

tool.onMouseUp = () => {
	isDrawing = false;
};

export default tool;