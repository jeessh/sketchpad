import {
	CursorIcon,
	EyeClosedIcon,
	EyeOpenIcon,
	HandIcon,
	PencilIcon,
	SquareIcon
} from '$lib/icons';

type IconName = 'cursor' | 'hand' | 'pencil' | 'eye-open' | 'eye-closed' | 'square';

interface IconProps {
	name: IconName;
	width?: string | number;
	height?: string | number;
	className?: string;
}

const icons: Record<IconName, { box: number; svg: string }> = {
	cursor: {
		box: 15,
		svg: CursorIcon
	},
	hand: {
		box: 15,
		svg: HandIcon
	},
	pencil: {
		box: 15,
		svg: PencilIcon
	},
	'eye-open': {
		box: 15,
		svg: EyeOpenIcon
	},
	'eye-closed': {
		box: 15,
		svg: EyeClosedIcon
	},
	square: {
		box: 15,
		svg: SquareIcon
	}
};

const Icon = ({ name, width = '1rem', height = '1rem', className }: IconProps) => {
	const displayIcon = icons[name];

	return (
		<svg
			className={className}
			width={width}
			height={height}
			viewBox={`0 0 ${displayIcon.box} ${displayIcon.box}`}
			dangerouslySetInnerHTML={{ __html: displayIcon.svg }}
		/>
	);
};

export default Icon;
