<script lang="ts">
	import type { LayerInfo } from '$lib/stores/layerManagerStore';
	import { 
		selectLayer, 
		renameLayer, 
		toggleLayerVisibility, 
		toggleLayerLock,
		deleteLayer
	} from '$lib/stores/layerManagerStore';
	import VisibilityToggle from './VisibilityToggle.svelte';

	export let layer: LayerInfo;
	export let isActive: boolean;
	export let onStartDrag: (layerId: string) => void;

	let isEditing = false;
	let editingName = layer.name;

	const handleClick = () => {
		if (!isEditing) {
			selectLayer(layer.id);
		}
	};

	const handleDoubleClick = () => {
		isEditing = true;
		editingName = layer.name;
	};

	const handleNameSubmit = () => {
		if (editingName.trim()) {
			renameLayer(layer.id, editingName.trim());
		}
		isEditing = false;
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleNameSubmit();
		} else if (e.key === 'Escape') {
			isEditing = false;
			editingName = layer.name;
		}
	};

	const handleVisibilityToggle = () => {
		toggleLayerVisibility(layer.id);
	};

	const handleLockToggle = () => {
		toggleLayerLock(layer.id);
	};

	const handleDelete = (e: Event) => {
		e.stopPropagation();
		deleteLayer(layer.id);
	};

	const handleDragStart = (e: DragEvent) => {
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', layer.id);
			onStartDrag(layer.id);
		}
	};

	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	};
</script>

<div 
	class="layer-item" 
	class:active={isActive}
	class:locked={layer.locked}
	on:click={handleClick}
	on:dblclick={handleDoubleClick}
	on:keypress={handleKeyPress}
	draggable="true"
	on:dragstart={handleDragStart}
	role="button"
	tabindex="0"
>
	<div class="layer-content">
		<div class="drag-handle">⋮⋮</div>
		
		<div class="layer-name">
			{#if isEditing}
				<input
					type="text"
					bind:value={editingName}
					on:blur={handleNameSubmit}
					on:keydown={handleKeyDown}
					class="name-input"
				/>
			{:else}
				<span class="name-text">{layer.name}</span>
			{/if}
		</div>

		<div class="layer-controls">
			<button
				class="control-btn lock-btn"
				class:locked={layer.locked}
				on:click|stopPropagation={handleLockToggle}
				title={layer.locked ? 'Unlock layer' : 'Lock layer'}
			>
				{#if layer.locked}🔒{:else}🔓{/if}
			</button>
			
			<VisibilityToggle
				visible={layer.visible}
				setVisible={handleVisibilityToggle}
			/>
			
			<button
				class="control-btn delete-btn"
				on:click={handleDelete}
				title="Delete layer"
			>
				🗑️
			</button>
		</div>
	</div>
</div>

<style>
	.layer-item {
		padding: 8px;
		border-radius: 4px;
		cursor: pointer;
		user-select: none;
		transition: background-color 0.1s ease;
		border: 1px solid transparent;
	}

	.layer-item:hover {
		background-color: #303437;
	}

	.layer-item.active {
		background-color: #1D71AE;
		border-color: #1D71AE;
	}

	.layer-item.locked {
		opacity: 0.6;
	}

	.layer-content {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.drag-handle {
		cursor: grab;
		color: #b3b3b3;
		font-size: 12px;
		line-height: 1;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.layer-name {
		flex: 1;
		min-width: 0;
	}

	.name-input {
		background: #2b2b2b;
		border: 1px solid #1D71AE;
		border-radius: 4px;
		color: white;
		padding: 2px 6px;
		width: 100%;
		outline: none;
	}

	.name-text {
		color: white;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.layer-controls {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.control-btn {
		background: transparent;
		border: none;
		color: #b3b3b3;
		cursor: pointer;
		padding: 4px;
		border-radius: 3px;
		font-size: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
	}

	.control-btn:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.lock-btn.locked {
		color: #ff6b6b;
	}

	.delete-btn:hover {
		color: #ff6b6b;
	}
</style> 