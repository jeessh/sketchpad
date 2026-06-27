import paper from 'paper';

export const getFill = (items: paper.Item | paper.Item[]): paper.Color[] => {
	if (Array.isArray(items)) {
		return items.map((item) => item.fillColor as paper.Color);
	}
	return [(items as paper.Item).fillColor as paper.Color];
};

export const setFill = (items: paper.Item | paper.Item[], color: paper.Color): void => {
	if (Array.isArray(items)) {
		items.forEach((item) => {
			item.fillColor = color;
		});
	} else {
		(items as paper.Item).fillColor = color;
	}
};

export const getStroke = (items: paper.Item | paper.Item[]): paper.Color[] => {
	if (Array.isArray(items)) {
		return items.map((item) => item.strokeColor as paper.Color);
	}
	return [(items as paper.Item).strokeColor as paper.Color];
};

export const setStroke = (items: paper.Item | paper.Item[], color: paper.Color): void => {
	if (Array.isArray(items)) {
		items.forEach((item) => {
			item.strokeColor = color;
		});
	} else {
		(items as paper.Item).strokeColor = color;
	}
};

export const getStrokeWidth = (items: paper.Item[]): number => {
	if (items.length === 0) return 0;
	return items[0].strokeWidth ?? 0;
};

export const setStrokeWidth = (items: paper.Item[], width: number): void => {
	items.forEach((item) => {
		item.strokeWidth = width;
	});
};
