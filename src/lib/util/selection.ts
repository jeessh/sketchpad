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
	const corners = [b.topLeft, b.topRight, b.bottomLeft, b.bottomRight];
	const cursors = ['nwse-resize', 'nesw-resize', 'nesw-resize', 'nwse-resize'];
	corners.forEach(function (corner, i) {
		const h = new Path.Rectangle({
			center: corner,
			size: s,
			strokeWidth: 1 / paper.view.zoom
		});
		h.fillColor = new Color('white');
		h.data.internal = true;
		h.data.cursor = cursors[i];
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
		[
			[x, y],
			[x + width, y]
		],
		[
			[x + width, y],
			[x + width, y + height]
		],
		[
			[x + width, y + height],
			[x, y + height]
		],
		[
			[x, y + height],
			[x, y]
		]
	];

	const cursors = ['ns-resize', 'ew-resize', 'ns-resize', 'ew-resize'];

	lines.forEach(function (line, i) {
		const [from, to] = line;
		const l = new Path.Line({
			from,
			to,
			strokeWidth
		});
		l.data.internal = true;
		l.data.cursor = cursors[i];
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
