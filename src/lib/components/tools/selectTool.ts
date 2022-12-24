import paper, { Color, Path, Size } from 'paper';
import { shiftKeyPressed } from '$lib/stores/keyboardStateStore';

let selectRectangle: paper.Path.Rectangle | null = null;
let selectStartPoint: paper.Point | null = null;

let isShiftKeyPressed = false;
shiftKeyPressed.subscribe((value) => {
  isShiftKeyPressed = value;
});

// create the select tool
const tool = new paper.Tool();
tool.onMouseDown = (event: paper.ToolEvent) => {
	selectStartPoint = event.point;
	selectRectangle = new Path.Rectangle(event.point, new Size(0, 0));
	selectRectangle.strokeWidth = 1 / paper.view.zoom;
	selectRectangle.strokeColor = new Color('rgba(20, 143, 236, 1)');
	selectRectangle.fillColor = new Color('rgba(20, 143, 236, 0.2)');
	selectRectangle.data = { internal: true };
	selectRectangle.layer.data = { internal: true };
};

// expand the rectangle to the current mouse position
tool.onMouseDrag = (event: paper.ToolEvent) => {
	if (selectRectangle && selectStartPoint) {
		selectRectangle.remove();
		selectRectangle = new Path.Rectangle(selectStartPoint, event.point);
		selectRectangle.strokeWidth = 1 / paper.view.zoom;
		selectRectangle.strokeColor = new Color('rgba(20, 143, 236, 1)');
		selectRectangle.fillColor = new Color('rgba(20, 143, 236, 0.2)');
		selectRectangle.data = { internal: true };
		selectRectangle.layer.data = { internal: true };
	}
};

// select all items that collide with the rectangle, highlighting in a blue border
tool.onMouseUp = (event: paper.ToolEvent) => {
	if (selectRectangle) {
		const isSingleClick = selectRectangle.bounds.width === 0 && selectRectangle.bounds.height === 0;

		const items = isSingleClick
			? paper.project
					.hitTestAll(event.point, {
						fill: true,
						stroke: true,
						segments: true,
						tolerance: 5
					})
					.map((hit) => hit.item)
					.filter((item) => !item.data.internal)
			: paper.project.getItems({
					overlapping: selectRectangle.bounds,
					class: paper.Path,
					match: (item: paper.Item) => {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						const rectangleInside = item.bounds.contains(selectRectangle!.bounds);
						return !item.data.internal && !rectangleInside;
					}
				});

		if (items.length === 0 || !isShiftKeyPressed) {
			clearSelected();
		}

		// create bounding box
		items.forEach((item) => {
			item.selected = true;
		});

		// remove the rectangle
		selectRectangle?.remove();
	}
};

const clearSelected = () => {
	paper.project.selectedItems.forEach(function (o) {
		// console.log("Unselect Item", o.name);
		// o.data.highlight.visible = false;
		o.selected = false;
		// o.layer.selected = false;
	});
	paper.project.activeLayer.selected = false;
};

export default tool;