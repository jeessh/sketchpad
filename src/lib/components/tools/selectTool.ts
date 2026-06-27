import paper, { Color, Path } from 'paper';
import { shiftKeyPressed } from '$lib/stores/keyboardStateStore';
import {
	drawHighlight,
	highlightItem,
	selectedItemsStore,
	selectionBoundsStore,
	selectObject,
	unhighlightItem,
	unselectAll,
	unselectObject
} from '$lib/stores/layerStateStore';
import { Scaler } from '$lib/util/scale';

let selectRectangle: paper.Path.Rectangle | null = null;
let selectStartPoint: paper.Point | null = null;
let moving = false;
let moved = false;

let isShiftKeyPressed = false;
shiftKeyPressed.subscribe((value) => {
	isShiftKeyPressed = value;
});

let selectedItems = new Set<paper.Item>();
selectedItemsStore.subscribe((value) => {
	selectedItems = value;
});

let selectionBounds: paper.Rectangle | undefined;
selectionBoundsStore.subscribe((value) => {
	selectionBounds = value;
});

// create the select tool
const tool = new paper.Tool();
tool.onMouseMove = (event: paper.ToolEvent) => {
	// do a hit test on the mouse position, if over a corner, change the cursor
	const hitResult = paper.project.hitTest(event.point, {
		fill: true,
		stroke: true,
		segments: true,
		tolerance: 5
	});

	if (hitResult) {
		const { item } = hitResult;
		if (item.data?.cursor) {
			paper.view.element.style.cursor = item.data?.cursor;
		} else {
			if (!selectionBounds || !selectionBounds.contains(event.point)) {
				highlightItem(item);
			}
			paper.view.element.style.cursor = 'default';
		}
	} else {
		unhighlightItem();
		paper.view.element.style.cursor = 'default';
	}
};

const inSelectionBounds = (point: paper.Point) => {
	const tolerance = 5 / paper.view.zoom;
	return selectionBounds && selectionBounds.expand(tolerance).contains(point);
};

let originalSelectedItems: Set<paper.Item>;
let scaler: Scaler | null = null;
let clickedItem: paper.Item | null = null;
tool.onMouseDown = (event: paper.ToolEvent) => {
	const hitResult = paper.project.hitTest(event.point, {
		fill: true,
		stroke: true,
		segments: true,
		tolerance: 5
	});

	if (hitResult) {
		const { item } = hitResult;

		if (item.data?.resize && item.data?.type && selectionBounds) {
			const type = item.data.type;

			scaler = new Scaler({
				scaleStartPoint: event.point,
				scaleType: item.data.resize
			});

			scaler.setScaleAboutPoint(type, selectionBounds);

			return;
		} else {
			if (!inSelectionBounds(event.point) && !isShiftKeyPressed) {
				unselectAll();
			} else {
				clickedItem = item;
			}

			// create bounding box
			if (isShiftKeyPressed && selectedItems.has(item)) {
				unselectObject(item);
			} else {
				selectObject(item);
			}
		}
	}

	// if inside selection bounds
	if (inSelectionBounds(event.point)) {
		moving = true;
		moved = false;
		unhighlightItem();
		return;
	} else {
		if (!isShiftKeyPressed) {
			unselectAll();
		}
	}

	selectStartPoint = event.point;
	originalSelectedItems = new Set(selectedItems);
};

// expand the rectangle to the current mouse position
tool.onMouseDrag = (event: paper.ToolEvent) => {
	if (scaler) {
		scaler.scaleSelection(event.point);
	} else if (moving) {
		const { x, y } = event.delta;
		selectedItems.forEach((item) => {
			item.position = item.position.add(new paper.Point(x, y));
		});
		moved = true;
		drawHighlight();
	} else if (selectStartPoint) {
		selectRectangle?.remove();
		selectRectangle = new Path.Rectangle(selectStartPoint, event.point);
		selectRectangle.strokeWidth = 1 / paper.view.zoom;
		selectRectangle.strokeColor = new Color('rgba(20, 143, 236, 1)');
		selectRectangle.fillColor = new Color('rgba(20, 143, 236, 0.2)');
		selectRectangle.data.internal = true;
		selectRectangle.layer.data.internal = true;

		let items: paper.Item[] = [];
		items = paper.project
			.getItems({
				match: (item: paper.Item) => {
					return !item.data.internal;
				}
			})
			.filter((item) => {
				if (item.className === 'Path') {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					return item.intersects(selectRectangle!) || item.isInside(selectRectangle!.bounds);
				} else if (item.className === 'Group' || item.className === 'CompoundPath') {
					return item.children.some((child) => {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						return child.intersects(selectRectangle!) || child.isInside(selectRectangle!.bounds);
					});
				} else {
					return false;
				}
			});

		// if shift key is pressed, add to current selection, otherwise replace selection
		if (isShiftKeyPressed) {
			items.forEach((item) => {
				if (originalSelectedItems.has(item)) {
					unselectObject(item);
				} else {
					selectObject(item);
				}
			});
		} else {
			originalSelectedItems.forEach((item) => {
				unselectObject(item);
			});
			items.forEach((item) => {
				selectObject(item);
			});
		}
	}
};

// select all items that collide with the rectangle, highlighting in a blue border
tool.onMouseUp = () => {
	// remove the rectangle
	selectRectangle?.remove();
	selectRectangle = null;

	if (moving && !moved && clickedItem && !isShiftKeyPressed) {
		unselectAll();
		selectObject(clickedItem);
	}

	moving = false;
	moved = false;
	scaler = null;
	clickedItem = null;
};

// when switching to pan tool, remove the selection rectangle
tool.onKeyDown = (event: paper.KeyEvent) => {
	if (event.key === 'space') {
		selectRectangle?.remove();
		selectRectangle = null;
	} else if (event.key === 'escape') {
		unselectAll();
	} else if (event.key === 'backspace') {
		selectedItems.forEach((item) => {
			item.remove();
		});
		selectedItemsStore.set(new Set());
		drawHighlight();
	}
};

export default tool;
