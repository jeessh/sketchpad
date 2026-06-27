import Input from './Input';

interface OpacityInputProps {
	opacity: number;
	setOpacity: (opacity: number) => void;
}

const OpacityInput = ({ opacity, setOpacity }: OpacityInputProps) => {
	const displayOpacity = `${Math.round(opacity * 100)}%`;

	const updateOpacity = (event: React.ChangeEvent<HTMLInputElement>) => {
		const nextOpacity = parseFloat(event.currentTarget.value) / 100;
		if (Number.isNaN(nextOpacity)) return;
		setOpacity(nextOpacity);
	};

	return (
		<div className="opacity-input-wrapper">
			<Input
				type="text"
				value={displayOpacity}
				onChange={updateOpacity}
				onFocus={(event) => event.currentTarget.select()}
			/>
		</div>
	);
};

export default OpacityInput;
