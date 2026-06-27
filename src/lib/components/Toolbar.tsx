import Icon from '$lib/components/Icon';
import { useStoreValue } from '$lib/hooks/useStoreValue';
import { currentTool, setCurrentTool, type TTool } from '$lib/stores/globalStateStore';

const tools: Array<{ id: TTool; icon: 'cursor' | 'hand' | 'square' | 'pencil'; label: string }> = [
	{
		id: 'select',
		icon: 'cursor',
		label: 'Select'
	},
	{
		id: 'pan',
		icon: 'hand',
		label: 'Pan'
	},
	{
		id: 'rectangle',
		icon: 'square',
		label: 'Rectangle'
	},
	{
		id: 'pencil',
		icon: 'pencil',
		label: 'Pencil'
	}
];

const Toolbar = () => {
	const activeTool = useStoreValue(currentTool);

	return (
		<div className="toolbar">
			{tools.map((tool) => (
				<button
					key={tool.id}
					type="button"
					className={`toolbar-tool${activeTool === tool.id ? ' active' : ''}`}
					aria-label={tool.label}
					title={tool.label}
					onClick={() => setCurrentTool(tool.id)}
				>
					<Icon height="15" width="15" name={tool.icon} className="block" />
				</button>
			))}
		</div>
	);
};

export default Toolbar;
