import { writable } from 'svelte/store';
import paper from 'paper';

export const selectedItemsStore = writable(new Set<paper.Item>());