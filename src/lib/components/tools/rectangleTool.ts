import { setCurrentTool } from '$lib/stores/globalStateStore';
import { selectObject, unselectAll, unselectObject } from '$lib/stores/layerStateStore';
import paper, { Path } from 'paper';

let path: paper.Path | undefined;
let isDrawing = false;
let startPoint: paper.Point;

const tool = new paper.Tool();

tool.onMouseDown = (event: paper.ToolEvent) => {
	isDrawing = true;
	startPoint = event.point;
    unselectAll();
};

tool.onMouseMove = (event: paper.ToolEvent) => {
	if (isDrawing) {
        path?.remove();
        if (path) {
            unselectObject(path);
        }

        path = new Path.Rectangle({
            from: startPoint,
            to: event.point,
            fillColor: '#C4C4C4',
        });

        selectObject(path);
	}
};

tool.onMouseUp = () => {
	isDrawing = false;
    if (path) {
        selectObject(path);
        setCurrentTool('select');
    }
    path = undefined;
};

export default tool;