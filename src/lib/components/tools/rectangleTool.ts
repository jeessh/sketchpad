import paper, { Color, Path, Point, Size } from 'paper';

let path: paper.Path | undefined;
let isDrawing = false;
let startPoint: paper.Point;

const tool = new paper.Tool();

tool.onMouseDown = (event: paper.ToolEvent) => {
	isDrawing = true;
	startPoint = event.point;
};

tool.onMouseMove = (event: paper.ToolEvent) => {
	if (isDrawing) {
        path?.remove();

        path = new Path.Rectangle({
            from: startPoint,
            to: event.point,
            strokeColor: 'black',
            strokeWidth: 1 / paper.view.zoom,
        });
	}
};

tool.onMouseUp = () => {
	isDrawing = false;
    path = undefined;
};

export default tool;