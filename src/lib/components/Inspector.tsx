import { useEffect, useRef, useState } from 'react';
import paper from 'paper';
import ColorInput from '$lib/components/common/ColorInput';
import Input from '$lib/components/common/Input';
import OpacityInput from '$lib/components/common/OpacityInput';
import VisibilityToggle from '$lib/components/common/VisibilityToggle';
import LayersPanel from '$lib/components/LayersPanel';
import { useStoreValue } from '$lib/hooks/useStoreValue';
import {
	drawHighlight,
	selectedItemsStore,
	selectionBoundsStore
} from '$lib/stores/layerStateStore';
import { getFill, getStroke, getStrokeWidth, setFill, setStroke, setStrokeWidth } from '$lib/util/properties';

const Inspector = () => {
	const bounds = useStoreValue(selectionBoundsStore);
	const selectedItems = useStoreValue(selectedItemsStore);

	const [fillVisible, setFillVisible] = useState(true);
	const [fillColor, setFillColorState] = useState<Array<paper.Color | null>>([]);
	const [fillOpacity, setFillOpacity] = useState(1.0);
	const [strokeVisible, setStrokeVisible] = useState(true);
	const [strokeColor, setStrokeColorState] = useState<Array<paper.Color | null>>([]);
	const [strokeOpacity, setStrokeOpacity] = useState(1.0);
	const [strokeWidth, setStrokeWidthState] = useState(0);
	const savedFillColors = useRef<Array<paper.Color | null>>([]);
	const savedStrokeColors = useRef<Array<paper.Color | null>>([]);

	useEffect(() => {
		const items = Array.from(selectedItems);
		const fills = getFill(items);
		const strokes = getStroke(items);
		setFillColorState(fills);
		setStrokeColorState(strokes);

		const fillHidden = fills.every((c) => c === null);
		const strokeHidden = strokes.every((c) => c === null);
		setFillVisible(!fillHidden);
		setStrokeVisible(!strokeHidden);

		// Only update saved colors when the modifier is visible (non-null colors exist)
		if (!fillHidden) {
			savedFillColors.current = fills.map((c) => c ? c.clone() : null);
		}
		if (!strokeHidden) {
			savedStrokeColors.current = strokes.map((c) => c ? c.clone() : null);
		}

		const firstFill = fills.find((c) => c !== null);
		if (firstFill) setFillOpacity(firstFill.alpha);
		const firstStroke = strokes.find((c) => c !== null);
		if (firstStroke) setStrokeOpacity(firstStroke.alpha);
		setStrokeWidthState(getStrokeWidth(items));
	}, [selectedItems]);

	const setFillColor = (color: paper.Color) => {
		setFill(Array.from(selectedItems), color);
		const fills = getFill(Array.from(selectedItems));
		setFillColorState(fills);
		const firstFill = fills.find((c) => c !== null);
		if (firstFill) setFillOpacity(firstFill.alpha);
	};

	const setStrokeColor = (color: paper.Color) => {
		setStroke(Array.from(selectedItems), color);
		const strokes = getStroke(Array.from(selectedItems));
		setStrokeColorState(strokes);
		const firstStroke = strokes.find((c) => c !== null);
		if (firstStroke) setStrokeOpacity(firstStroke.alpha);
	};

	const applyFillOpacity = (opacity: number) => {
		selectedItems.forEach((item) => {
			if (item.fillColor) item.fillColor.alpha = opacity;
		});
		setFillOpacity(opacity);
	};

	const applyStrokeOpacity = (opacity: number) => {
		selectedItems.forEach((item) => {
			if (item.strokeColor) item.strokeColor.alpha = opacity;
		});
		setStrokeOpacity(opacity);
	};

	const applyFillVisible = (visible: boolean) => {
		const items = Array.from(selectedItems);
		if (visible) {
			items.forEach((item, i) => { item.fillColor = savedFillColors.current[i] ?? null; });
		} else {
			savedFillColors.current = items.map((item) => item.fillColor ? item.fillColor.clone() : null);
			items.forEach((item) => { item.fillColor = null; });
		}
		setFillVisible(visible);
	};

	const applyStrokeVisible = (visible: boolean) => {
		const items = Array.from(selectedItems);
		if (visible) {
			items.forEach((item, i) => { item.strokeColor = savedStrokeColors.current[i] ?? null; });
		} else {
			savedStrokeColors.current = items.map((item) => item.strokeColor ? item.strokeColor.clone() : null);
			items.forEach((item) => { item.strokeColor = null; });
		}
		setStrokeVisible(visible);
	};

	const applyStrokeWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
		const width = parseFloat(event.currentTarget.value);
		if (Number.isNaN(width)) return;
		const clamped = Math.max(0, width);
		setStrokeWidth(Array.from(selectedItems), clamped);
		setStrokeWidthState(clamped);
	};

	const updateX = (event: React.ChangeEvent<HTMLInputElement>) => {
		const x = parseFloat(event.currentTarget.value);
		if (Number.isNaN(x)) return;
		selectedItems.forEach((item) => {
			item.position.x = x + item.bounds.width / 2;
		});

		drawHighlight();
	};

	const updateY = (event: React.ChangeEvent<HTMLInputElement>) => {
		const y = parseFloat(event.currentTarget.value);
		if (Number.isNaN(y)) return;
		selectedItems.forEach((item) => {
			item.position.y = y + item.bounds.height / 2;
		});

		drawHighlight();
	};

	const updateWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
		const width = parseFloat(event.currentTarget.value);
		if (Number.isNaN(width)) return;
		selectedItems.forEach((item) => {
			item.bounds.width = width;
		});

		drawHighlight();
	};

	const updateHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
		const height = parseFloat(event.currentTarget.value);
		if (Number.isNaN(height)) return;
		selectedItems.forEach((item) => {
			item.bounds.height = height;
		});

		drawHighlight();
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		event.stopPropagation();
		if (event.key === 'Enter') {
			event.currentTarget.blur();
		}
	};

	return (
		<div className="inspector" onKeyDown={(event) => event.stopPropagation()}>
			<div className="sections">
				<LayersPanel />
				{bounds ? (
					<div className="section">
						<div className="title">Transform</div>
						<div className="content">
							<div className="flex gap-4">
								<div className="w-1/2">
									<Input
										label="X"
										type="text"
										className="w-full"
										value={bounds.x}
										onChange={updateX}
										onKeyDown={handleKeyDown}
									/>
								</div>
								<div className="w-1/2">
									<Input
										label="Y"
										type="text"
										className="w-full"
										value={bounds.y}
										onChange={updateY}
										onKeyDown={handleKeyDown}
									/>
								</div>
							</div>
							<div className="flex gap-4">
								<div className="w-1/2">
									<Input
										label="W"
										type="text"
										className="w-full"
										value={bounds.width}
										onChange={updateWidth}
										onKeyDown={handleKeyDown}
									/>
								</div>
								<div className="w-1/2">
									<Input
										label="H"
										type="text"
										className="w-full"
										value={bounds.height}
										onChange={updateHeight}
										onKeyDown={handleKeyDown}
									/>
								</div>
							</div>
						</div>
					</div>
				) : null}
				<div className="section">
					<div className="title">Fill</div>
					<div className="content">
						<div className="flex">
							<div className="flex min-w-0">
								<ColorInput color={fillColor} setColor={setFillColor} />
								<div className="input-divider" />
								<OpacityInput opacity={fillOpacity} setOpacity={applyFillOpacity} />
							</div>
							<div className="ml-1 h-full">
								<VisibilityToggle visible={fillVisible} setVisible={applyFillVisible} />
							</div>
						</div>
					</div>
				</div>
				<div className="section">
					<div className="title">Stroke</div>
					<div className="content">
						<div className="flex">
							<div className="flex min-w-0">
								<ColorInput color={strokeColor} setColor={setStrokeColor} />
								<div className="input-divider" />
								<OpacityInput opacity={strokeOpacity} setOpacity={applyStrokeOpacity} />
							</div>
							<div className="ml-1 h-full">
								<VisibilityToggle visible={strokeVisible} setVisible={applyStrokeVisible} />
							</div>
						</div>
						<div className="flex">
							<Input
								label="W"
								type="text"
								value={strokeWidth}
								onChange={applyStrokeWidth}
								onKeyDown={handleKeyDown}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Inspector;
