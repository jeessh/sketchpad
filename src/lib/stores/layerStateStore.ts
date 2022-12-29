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
    // remove blue border from previous selected items
    selectedItems.forEach((item: paper.Item) => {
        item.style = {
            ...item.style,
            ...oldStyles[item.id],
        }
    });

    selectedItems = value;

    selectedItems.forEach((item: paper.Item) => {
        // set old style
        if (!oldStyles[item.id]) {
            oldStyles[item.id] = {
                strokeColor: item.strokeColor,
            }
        }

        // add blue border
        item.style = {
            ...item.style,
            strokeColor: new Color('rgba(20, 143, 236, 1)'),
        };
    });
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
highlightedItemStore.subscribe((value) => {
    // remove blue border from previous highlighted item
    if (highlightedItem && !selectedItems.has(highlightedItem)) {
        highlightedItem.style = {
            ...highlightedItem.style,
            ...oldStyles[highlightedItem.id],
        }
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

        highlightedItem.style = {
            ...highlightedItem.style,
            strokeColor: new Color('rgba(20, 143, 236, 1)'),
        };
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