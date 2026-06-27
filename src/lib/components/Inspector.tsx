import { useEffect, useState } from 'react';
import paper from 'paper';
import ColorInput from '$lib/components/common/ColorInput';
import Input from '$lib/components/common/Input';
import OpacityInput from '$lib/components/common/OpacityInput';
import VisibilityToggle from '$lib/components/common/VisibilityToggle';
import { useStoreValue } from '$lib/hooks/useStoreValue';
import {
	drawHighlight,
	selectedItemsStore,
	selectionBoundsStore
} from '$lib/stores/layerStateStore';
import { getFill, getStroke } from '$lib/util/properties';

const Inspector = () => {
	const bounds = useStoreValue(selectionBoundsStore);
	const selectedItems = useStoreValue(selectedItemsStore);

	const [fillVisible, setFillVisible] = useState(true);
	const [fillColor, setFillColorState] = useState<Array<paper.Color | null>>([]);
	const [fillOpacity, setFillOpacity] = useState(1.0);
	const [strokeVisible, setStrokeVisible] = useState(true);
	const [strokeColor, setStrokeColorState] = useState<Array<paper.Color | null>>([]);
	const [strokeOpacity, setStrokeOpacity] = useState(1.0);

	useEffect(() => {
		const items = Array.from(selectedItems);
		setFillColorState(getFill(items));
		setStrokeColorState(getStroke(items));
	}, [selectedItems]);

	const setFillColor = (color: paper.Color) => {
		selectedItems.forEach((item) => {
			item.fillColor = color;
		});
		setFillColorState(getFill(Array.from(selectedItems)));
	};

	const setStrokeColor = (color: paper.Color) => {
		selectedItems.forEach((item) => {
			item.strokeColor = color;
		});
		setStrokeColorState(getStroke(Array.from(selectedItems)));
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
								<OpacityInput opacity={fillOpacity} setOpacity={setFillOpacity} />
							</div>
							<div className="ml-1 h-full">
								<VisibilityToggle visible={fillVisible} setVisible={setFillVisible} />
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
								<OpacityInput opacity={strokeOpacity} setOpacity={setStrokeOpacity} />
							</div>
							<div className="ml-1 h-full">
								<VisibilityToggle visible={strokeVisible} setVisible={setStrokeVisible} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Inspector;
