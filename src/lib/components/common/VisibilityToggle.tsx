import Icon from '$lib/components/Icon';

interface VisibilityToggleProps {
	visible: boolean;
	setVisible: (visible: boolean) => void;
}

const VisibilityToggle = ({ visible, setVisible }: VisibilityToggleProps) => {
	return (
		<button
			type="button"
			className="visibility-toggle"
			aria-label={visible ? 'Hide' : 'Show'}
			title={visible ? 'Hide' : 'Show'}
			onClick={() => setVisible(!visible)}
		>
			<Icon name={visible ? 'eye-open' : 'eye-closed'} />
		</button>
	);
};

export default VisibilityToggle;
