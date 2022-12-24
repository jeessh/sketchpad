import paper, { Color, Path, Group } from 'paper';

const makeCorners = (o: paper.Item) => {
	const s = 7 / paper.view.zoom;
	const g = new Group();
	const corners = [
		o.strokeBounds.topLeft,
		o.strokeBounds.topRight,
		o.strokeBounds.bottomLeft,
		o.strokeBounds.bottomRight
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

const makeBounds = (o: paper.Item) => {
	const r = new Path.Rectangle({
		rectangle: o.strokeBounds,
		strokeWidth: 1 / paper.view.zoom
	});
	r.data.internal = true;
	return r;
};

export const drawHighlight = (item: paper.Item) => {
	item.data.highlight?.remove();

	item.data.highlight = new Group({
		children: [makeBounds(item), makeCorners(item)],
		strokeColor: 'rgba(20, 143, 236, 1)',
		visible: true
	});

	item.data.highlight.data.internal = true;
};
