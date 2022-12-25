import { writable } from 'svelte/store';
import paper, { Color } from 'paper';

export const selectedItemsStore = writable(new Set<paper.Item>());
export const selectionBoundsStore = writable<paper.Rectangle | undefined>();

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