import paper, { Color, Path, Size } from 'paper';
import { shiftKeyPressed } from '$lib/stores/keyboardStateStore';
import { selectedItemsStore } from '$lib/stores/layerStateStore';
import { drawHighlight } from '$lib/util/selection';

let selectRectangle: paper.Path.Rectangle | null = null;
let selectStartPoint: paper.Point | null = null;

let isShiftKeyPressed = false;
shiftKeyPressed.subscribe((value) => {
	isShiftKeyPressed = value;
});

let selectedItems = new Set<paper.Item>();
selectedItemsStore.subscribe((value) => {
	selectedItems = value;
});

const selectObject = (item: paper.Item) => {
	if (!item.data.internal) {
		selectedItemsStore.set(new Set([...selectedItems, item]))
		drawHighlight(item);
	}
};

const unselectObject = (item: paper.Item) => {
	if (!item.data.internal) {
		selectedItemsStore.set(new Set([...selectedItems].filter((i) => i !== item)));
		if (item.data.highlight) {
			item.data.highlight.remove();
			delete item.data.highlight;
		}
	}
};

// create the select tool
const tool = new paper.Tool();
tool.onMouseDown = (event: paper.ToolEvent) => {
	selectStartPoint = event.point;
	selectRectangle = new Path.Rectangle(event.point, new Size(0, 0));
	selectRectangle.strokeWidth = 1 / paper.view.zoom;
	selectRectangle.strokeColor = new Color('rgba(20, 143, 236, 1)');
	selectRectangle.fillColor = new Color('rgba(20, 143, 236, 0.2)');
	selectRectangle.data.internal = true;
	selectRectangle.layer.data.internal = true;
};

// expand the rectangle to the current mouse position
tool.onMouseDrag = (event: paper.ToolEvent) => {
	if (selectRectangle && selectStartPoint) {
		selectRectangle.remove();
		selectRectangle = new Path.Rectangle(selectStartPoint, event.point);
		selectRectangle.strokeWidth = 1 / paper.view.zoom;
		selectRectangle.strokeColor = new Color('rgba(20, 143, 236, 1)');
		selectRectangle.fillColor = new Color('rgba(20, 143, 236, 0.2)');
		selectRectangle.data.internal = true;
		selectRectangle.layer.data.internal = true;
	}
};

// tool.onMouseMove = (event: paper.ToolEvent) => {
// 	paper.project.activeLayer.selected = false;
// 	if (event.item && !event.item.data.internal) {
// 		event.item.selected = true;
// 	}
// }

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
			selectObject(item);
		});

		// remove the rectangle
		selectRectangle?.remove();
	}
};

const clearSelected = () => {
	selectedItems.forEach((layer) => {
		unselectObject(layer);
	});
};

export default tool;
