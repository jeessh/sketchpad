<script lang="ts">
	import { layersStore, activeLayerStore, createLayer, moveLayer, type LayerInfo } from '$lib/stores/layerManagerStore';
	import LayerItem from './LayerItem.svelte';

	let layers: LayerInfo[] = [];
	let activeLayerId: string | null = null;
	let draggedLayerId: string | null = null;
	let dragOverIndex: number | null = null;

	layersStore.subscribe((value) => {
		layers = value;
	});

	activeLayerStore.subscribe((value) => {
		activeLayerId = value;
	});

	const handleAddLayer = () => {
		createLayer();
	};

	const handleStartDrag = (layerId: string) => {
		draggedLayerId = layerId;
	};

	const handleDragOver = (e: DragEvent, index: number) => {
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'move';
		dragOverIndex = index;
	};

	const handleDragLeave = () => {
		dragOverIndex = null;
	};

	const handleDrop = (e: DragEvent, targetIndex: number) => {
		e.preventDefault();
		
		if (!draggedLayerId) return;
		
		const draggedIndex = layers.findIndex(layer => layer.id === draggedLayerId);
		
		if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
			moveLayer(draggedIndex, targetIndex);
		}
		
		draggedLayerId = null;
		dragOverIndex = null;
	};

	const handleDragEnd = () => {
		draggedLayerId = null;
		dragOverIndex = null;
	};
</script>

<div class="layer-manager">
	<div class="layer-header">
		<h3 class="layer-title">Layers</h3>
		<button class="add-layer-btn" on:click={handleAddLayer} title="Add new layer">
			+
		</button>
	</div>
	
	<div class="layer-list">
		{#each layers as layer, index (layer.id)}
			<div 
				class="layer-wrapper"
				class:drag-over={dragOverIndex === index}
				on:dragover={(e) => handleDragOver(e, index)}
				on:dragleave={handleDragLeave}
				on:drop={(e) => handleDrop(e, index)}
				on:dragend={handleDragEnd}
			>
				<LayerItem 
					{layer} 
					isActive={layer.id === activeLayerId}
					onStartDrag={handleStartDrag}
				/>
			</div>
		{/each}
		
		{#if layers.length === 0}
			<div class="empty-state">
				<p>No layers yet</p>
				<button class="create-first-layer-btn" on:click={handleAddLayer}>
					Create first layer
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.layer-manager {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.layer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.layer-title {
		margin: 0;
		color: white;
		font-size: 14px;
		font-weight: 500;
	}

	.add-layer-btn {
		background: #1D71AE;
		border: none;
		color: white;
		width: 24px;
		height: 24px;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		line-height: 1;
		transition: background-color 0.1s ease;
	}

	.add-layer-btn:hover {
		background: #2980cc;
	}

	.layer-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		max-height: 300px;
		overflow-y: auto;
	}

	.layer-wrapper {
		transition: transform 0.1s ease;
		border-radius: 4px;
	}

	.layer-wrapper.drag-over {
		transform: translateY(2px);
		box-shadow: 0 2px 4px rgba(29, 113, 174, 0.3);
	}

	.empty-state {
		text-align: center;
		padding: 24px 16px;
		color: #b3b3b3;
	}

	.empty-state p {
		margin: 0 0 12px 0;
		font-size: 14px;
	}

	.create-first-layer-btn {
		background: #1D71AE;
		border: none;
		color: white;
		padding: 8px 16px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		transition: background-color 0.1s ease;
	}

	.create-first-layer-btn:hover {
		background: #2980cc;
	}

	/* Custom scrollbar */
	.layer-list::-webkit-scrollbar {
		width: 6px;
	}

	.layer-list::-webkit-scrollbar-track {
		background: #2b2b2b;
		border-radius: 3px;
	}

	.layer-list::-webkit-scrollbar-thumb {
		background: #555;
		border-radius: 3px;
	}

	.layer-list::-webkit-scrollbar-thumb:hover {
		background: #777;
	}
</style> 