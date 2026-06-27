import { useState } from 'react';
import Input from './Input';

interface OpacityInputProps {
	opacity: number;
	setOpacity: (opacity: number) => void;
}

const OpacityInput = ({ opacity, setOpacity }: OpacityInputProps) => {
	const [focused, setFocused] = useState(false);
	const [rawValue, setRawValue] = useState('');

	const displayValue = focused ? rawValue : `${Math.round(opacity * 100)}%`;

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const str = event.currentTarget.value;
		setRawValue(str);
		if (str === '') {
			setOpacity(0);
			return;
		}
		const raw = parseFloat(str);
		if (Number.isNaN(raw)) return;
		const clamped = Math.min(100, Math.max(0, raw));
		setOpacity(clamped / 100);
	};

	const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
		setRawValue(String(Math.round(opacity * 100)));
		setFocused(true);
		const el = event.currentTarget;
		requestAnimationFrame(() => el.select());
	};

	const handleBlur = () => {
		setFocused(false);
		setRawValue('');
	};

	return (
		<div className="opacity-input-wrapper">
			<Input
				type="text"
				value={displayValue}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
		</div>
	);
};

export default OpacityInput;
