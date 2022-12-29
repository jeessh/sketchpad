import paper, { Color, Path } from 'paper';
import { shiftKeyPressed } from '$lib/stores/keyboardStateStore';
import {
	highlightedItemStore,
	selectedItemsStore,
	selectionBoundsStore
} from '$lib/stores/layerStateStore';
import { drawHighlight } from '$lib/util/selection';
import { Scaler } from '$lib/util/scale';
import { Rectangle } from 'paper/dist/paper-core';

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

let highlightedItem: paper.Item | undefined;
highlightedItemStore.subscribe((value) => {
	highlightedItem = value;
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

const unselectAll = () => {
	selectedItemsStore.set(new Set());
	drawHighlight();
};

const highlightItem = (item: paper.Item) => {
	highlightedItemStore.set(item);
};

const unhighlightItem = () => {
	highlightedItemStore.set(undefined);
};

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

let originalSelectedItems: Set<paper.Item>;
let scaler: Scaler | null = null;
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
		}

		if (!moved) {
			unselectAll();
		}

		if (!selectionBounds) {
			// if nothing is selected, select the item
			selectObject(item);
		}
	}

	// if inside selection bounds
	// const debugRect = selectionBounds?.expand(5);
	// draw debugRect
	// new Path.Rectangle(debugRect!).fillColor = new Color(1, 0, 0, 0.2);
	const tolerance = 5 / paper.view.zoom;

	if (selectionBounds && selectionBounds.expand(tolerance).contains(event.point)) {
		console.log('moving');
		moving = true;
		moved = false;
		return;
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
tool.onMouseUp = (event: paper.ToolEvent) => {
	let items: paper.Item[] = [];

	// single click
	if (!selectRectangle && !moved && !scaler) {
		items = paper.project
			.hitTestAll(event.point, {
				fill: true,
				stroke: true,
				segments: true,
				tolerance: 5
			})
			.map((hit) => hit.item)
			.filter((item) => !item.data.internal);

		// only get the topmost item
		if (items.length > 0) {
			items = [items[0]];
		}
		if (!isShiftKeyPressed) {
			selectedItemsStore.set(new Set());
			drawHighlight();
		}

		if (moving) {
			moving = false;
		}

		// create bounding box
		items.forEach((item) => {
			if (isShiftKeyPressed && selectedItems.has(item)) {
				unselectObject(item);
			} else {
				selectObject(item);
			}
		});
	}

	// remove the rectangle
	selectRectangle?.remove();
	selectRectangle = null;

	moved = false;
	scaler = null;
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
