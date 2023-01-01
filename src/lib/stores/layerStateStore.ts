import { writable } from 'svelte/store';
import paper, { Color, Group } from 'paper';
import { makeBounds, makeCorners } from '$lib/util/selection';

export const selectedItemsStore = writable(new Set<paper.Item>());
export const selectionBoundsStore = writable<paper.Rectangle | undefined>();
export const highlightedItemStore = writable<paper.Item | undefined>();

let highlight: paper.Group | null = null;

// dict of old styles
const oldStyles: Record<string, Partial<paper.Style>> = {};

// subscribe to selected items, whenever it changes add blue border to selected items, don't use draw highlight
let selectedItems: Set<paper.Item> = new Set();
selectedItemsStore.subscribe((value) => {
    selectedItems = value;
});

export const selectObject = (item: paper.Item) => {
	if (!item.data.internal) {
		selectedItemsStore.set(new Set([...selectedItems, item]));
		drawHighlight();
	}
};

export const unselectObject = (item: paper.Item) => {
	if (!item.data.internal) {
		selectedItemsStore.set(new Set([...selectedItems].filter((i) => i !== item)));
		drawHighlight();
	}
};

export const unselectAll = () => {
	selectedItemsStore.set(new Set());
	drawHighlight();
};

// subscribe to highlighted item, whenever it changes add blue border to highlighted item
let highlightedItem: paper.Item | undefined;
let highlightRectangle: paper.Path.Rectangle | null = null;
highlightedItemStore.subscribe((value) => {
    if (highlightRectangle) {
        highlightRectangle.remove();
        highlightRectangle = null;
    }

    highlightedItem = value;

    // add blue border
    if (highlightedItem) {
        // set old style
        if (!oldStyles[highlightedItem.id]) {
            oldStyles[highlightedItem.id] = {
                strokeColor: highlightedItem.strokeColor,
            }
        }

        if (!highlightRectangle) {
            highlightRectangle = new paper.Path.Rectangle({
                from: highlightedItem.bounds.topLeft,
                to: highlightedItem.bounds.bottomRight,
                strokeColor: new Color('rgba(20, 143, 236, 1)'),
                strokeWidth: 1 / paper.view.zoom,
                parent: highlightedItem,
            });
            highlightRectangle.data.internal = true;
        }
    }
});


export const highlightItem = (item: paper.Item) => {
	highlightedItemStore.set(item);
};

export const unhighlightItem = () => {
	highlightedItemStore.set(undefined);
};

export const drawHighlight = () => {
	highlight?.remove();

	if (selectedItems.size === 0) {
		selectionBoundsStore.set(undefined);
		return;
	}

	// get bounding box that contains all selected items
	let bounds = selectedItems.values().next().value.bounds;
	selectedItems.forEach((item) => {
		bounds = bounds.unite(item.bounds);
	});

	selectionBoundsStore.set(bounds);

	highlight = new Group({
		children: [makeBounds(bounds), makeCorners(bounds)],
		strokeColor: 'rgba(20, 143, 236, 1)',
		visible: true
	});

	highlight.data.internal = true;
};