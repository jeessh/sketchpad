import paper, { Color, Path } from 'paper';
import { shiftKeyPressed } from '$lib/stores/keyboardStateStore';
import { selectedItemsStore } from '$lib/stores/layerStateStore';
import { drawHighlight, clearHighlight } from '$lib/util/selection';

let selectRectangle: paper.Path.Rectangle | null = null;
let selectStartPoint: paper.Point | null = null;
let moving = false;

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
		selectedItemsStore.set(new Set([...selectedItems, item]));
		drawHighlight();
	}
};

const unselectObject = (item: paper.Item) => {
	if (!item.data.internal) {
		selectedItemsStore.set(new Set([...selectedItems].filter((i) => i !== item)));
		drawHighlight();
	}
};

// create the select tool
const tool = new paper.Tool();
tool.onMouseDown = (event: paper.ToolEvent) => {
	// perform hit test on all items
	const hitResult = paper.project.hitTest(event.point, {
		fill: true,
		stroke: true,
		segments: true,
		tolerance: 5
	});
	
	if (hitResult) {
		const item = hitResult.item;
		if (item.data?.moveable) {
			moving = true;
			return;
		}
	}

	selectStartPoint = event.point;
};

// expand the rectangle to the current mouse position
tool.onMouseDrag = (event: paper.ToolEvent) => {
	if (moving) {
		const { x, y } = event.delta;
		selectedItems.forEach((item) => {
			item.position = item.position.add(new paper.Point(x, y));
		});
		drawHighlight();
	} else if (selectStartPoint) {
		selectRectangle?.remove();
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
	if (moving) {
		moving = false;
		return;
	}
	
	let items: paper.Item[] = [];

	// single click
	if (!selectRectangle) {
		items = paper.project
			.hitTestAll(event.point, {
				fill: true,
				stroke: true,
				segments: true,
				tolerance: 5,
			})
			.map((hit) => hit.item)
			.filter((item) => !item.data.internal);

		// only get the topmost item
		if (items.length > 0) {
			items = [items[0]];
		}
	} else {
		items = paper.project.getItems({
			overlapping: selectRectangle?.bounds,
			match: (item: paper.Item) => {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const rectangleInside = item.bounds.contains(selectRectangle!.bounds);
				return !item.data.internal && !rectangleInside;
			}
		});
	}

	if (!isShiftKeyPressed) {
		selectedItemsStore.set(new Set());
		clearHighlight();
	}

	// create bounding box
	items.forEach((item) => {
		if (isShiftKeyPressed && selectedItems.has(item)) {
			unselectObject(item);
		} else {
			selectObject(item);
		}
	});

	// remove the rectangle
	selectRectangle?.remove();
	selectRectangle = null;
};

export default tool;
