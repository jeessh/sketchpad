import paper from 'paper';
import { setCursor } from '$lib/util/cursor';

const tool = new paper.Tool();

tool.onMouseDown = () => {
    setCursor('grabbing');
};

tool.onMouseDrag = (event: paper.ToolEvent) => {
    if (!event.downPoint) return;
	const offset = event.downPoint.subtract(event.point);
	paper.view.center = paper.view.center.add(offset);
};

tool.onMouseUp = () => {
    setCursor('grab');
};

export default tool;