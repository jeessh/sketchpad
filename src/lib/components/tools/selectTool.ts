import paper, { Color, Path } from 'paper';
import { shiftKeyPressed } from '$lib/stores/keyboardStateStore';
import { selectedItemsStore, selectionBoundsStore } from '$lib/stores/layerStateStore';
import { drawHighlight } from '$lib/util/selection';

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

let selectionBounds: paper.Rectangle | undefined;
selectionBoundsStore.subscribe((value) => {
	selectionBounds = value;
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
let originalSelectedItems: Set<paper.Item>;
tool.onMouseDown = (event: paper.ToolEvent) => {
	// if inside selection bounds
	if (selectionBounds && selectionBounds.contains(event.point)) {	
		moving = true;
		return;
	}

	selectStartPoint = event.point;
	originalSelectedItems = new Set(selectedItems);
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

		let items: paper.Item[] = [];
		items = paper.project.getItems({
			match: (item: paper.Item) => {
				return !item.data.internal;
			},
		}).filter((item) => {
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

tool.onMouseMove = (event: paper.ToolEvent) => {
	// do a hit test on the mouse position, if over a corner, change the cursor
	const hitResult = paper.project.hitTest(event.point, {
		fill: true,
		stroke: true,
		segments: true,
		class: paper.Path,
		tolerance: 5,
	});

	if (hitResult) {
		const { item } = hitResult;
		if (item.data?.cursor) {
			paper.view.element.style.cursor = item.data?.cursor;
		} else {
			paper.view.element.style.cursor = 'default';
		}
	} else {
		paper.view.element.style.cursor = 'default';
	}
}

// select all items that collide with the rectangle, highlighting in a blue border
tool.onMouseUp = (event: paper.ToolEvent) => {
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
		if (!isShiftKeyPressed && !moving) {
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
};

// when switching to pan tool, remove the selection rectangle
tool.onKeyDown = (event: paper.KeyEvent) => {
	if (event.key === 'space') {
		selectRectangle?.remove();
		selectRectangle = null;
	}
}

export default tool;
