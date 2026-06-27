import { useMemo } from 'react';
import paper, { Color } from 'paper';
import Input from './Input';

interface ColorInputProps {
	color: Array<paper.Color | null>;
	setColor: (color: paper.Color) => void;
}

const getColorString = (color: Array<paper.Color | null>) => {
	const colors = color.filter(Boolean) as paper.Color[];
	if (colors.length === 0) return undefined;

	const [firstColor] = colors;
	if (colors.length === color.length && colors.every((itemColor) => itemColor.equals(firstColor))) {
		return firstColor.toCSS(true);
	}

	return 'Mixed';
};

const normalizeHex = (value: string) => {
	let inputColor = value.trim();
	if (inputColor.startsWith('#')) {
		inputColor = inputColor.slice(1);
	}

	if (!/^[0-9a-fA-F]+$/.test(inputColor)) {
		return null;
	}

	while (inputColor.length < 6) {
		inputColor += inputColor;
	}

	return `#${inputColor.slice(0, 6)}`;
};

const ColorInput = ({ color, setColor }: ColorInputProps) => {
	const colorString = useMemo(() => getColorString(color), [color]);
	const displayColor = colorString === undefined ? 'None' : colorString;
	const colorInputValue = colorString?.startsWith('#') ? colorString : '#000000';

	const checkAndSetColor = (event: React.ChangeEvent<HTMLInputElement>) => {
		const normalized = normalizeHex(event.currentTarget.value);
		if (!normalized) return;

		setColor(new Color(normalized));
	};

	return (
		<div className="color-input-wrapper">
			<input
				type="color"
				value={colorInputValue}
				onInput={(event) => setColor(new Color(event.currentTarget.value))}
				aria-label="Color picker"
			/>
			<Input
				type="text"
				value={displayColor}
				onFocus={(event) => event.currentTarget.select()}
				onChange={checkAndSetColor}
			/>
		</div>
	);
};

export default ColorInput;
