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
		{
			type: 'topLeft',
			bounds: b.topLeft,
			cursor: 'nwse-resize',
			resize: 'both',
		},
		{
			type: 'topRight',
			bounds: b.topRight,
			cursor: 'nesw-resize',
			resize: 'both',
		},
		{
			type: 'bottomLeft',
			bounds: b.bottomLeft,
			cursor: 'nesw-resize',
			resize: 'both',
		},
		{
			type: 'bottomRight',
			bounds: b.bottomRight,
			cursor: 'nwse-resize',
			resize: 'both',
		},
	]
	corners.forEach(function (corner) {
		const h = new Path.Rectangle({
			center: corner.bounds,
			size: s,
			strokeWidth: 1 / paper.view.zoom
		});
		h.fillColor = new Color('white');
		h.data.internal = true;
		h.data.cursor = corner.cursor;
		h.data.resize = corner.resize;
		h.data.type = corner.type;
		g.addChild(h);
	});

	g.data.internal = true;
	return g;
};

const makeBounds = (b: paper.Rectangle) => {
	const x = b.x;
	const y = b.y;
	const width = b.width;
	const height = b.height;
	const strokeWidth = 1 / paper.view.zoom;

	const g = new Group();
	const lines = [
		{
			type: 'top',
			from: [x, y],
			to: [x + width, y],
			cursor: 'ns-resize',
			resize: 'height',
		},
		{
			type: 'right',
			from: [x + width, y],
			to: [x + width, y + height],
			cursor: 'ew-resize',
			resize: 'width',
		},
		{
			type: 'bottom',
			from: [x + width, y + height],
			to: [x, y + height],
			cursor: 'ns-resize',
			resize: 'height',
		},
		{
			type: 'left',
			from: [x, y + height],
			to: [x, y],
			cursor: 'ew-resize',
			resize: 'width',
		},
	];

	lines.forEach(function (line) {
		const l = new Path.Line({
			from: line.from,
			to: line.to,
			strokeWidth
		});
		l.data.internal = true;
		l.data.cursor = line.cursor;
		l.data.resize = line.resize;
		l.data.type = line.type;
		g.addChild(l);
	});

	g.data.internal = true;
	return g;
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