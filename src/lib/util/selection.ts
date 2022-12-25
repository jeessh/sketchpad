import paper, { Color, Path, Group } from 'paper';
import { selectedItemsStore, selectionBoundsStore } from '$lib/stores/layerStateStore';

let highlight: paper.Group | null = null;
let selectedItems = new Set<paper.Item>();
selectedItemsStore.subscribe((value) => {
	selectedItems = value;
});

const makeCorners = (b: paper.Rectangle) => {
	const s = 7 / paper.view.zoom;
	const g = new Group();
	const corners = [
		b.topLeft,
		b.topRight,
		b.bottomLeft,
		b.bottomRight
	];
	corners.forEach(function (corner) {
		const h = new Path.Rectangle({
			center: corner,
			size: s,
			strokeWidth: 1 / paper.view.zoom
		});
		h.fillColor = new Color('white');
		h.data.internal = true;
		g.addChild(h);
	});

	g.data.internal = true;
	return g;
};

const makeBounds = (b: paper.Rectangle) => {
	const r = new Path.Rectangle({
		rectangle: b,
		strokeWidth: 1 / paper.view.zoom
	});
	r.fillColor = new Color('rgba(255, 255, 255, 0.001)');
	r.data.internal = true;
	r.data.moveable = true;
	return r;
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