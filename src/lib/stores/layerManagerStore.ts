import { writable } from 'svelte/store';
import paper from 'paper';

export interface LayerInfo {
	id: string;
	name: string;
	layer: paper.Layer;
	visible: boolean;
	locked: boolean;
}

export const layersStore = writable<LayerInfo[]>([]);
export const activeLayerStore = writable<string | null>(null);

let layers: LayerInfo[] = [];
let activeLayerId: string | null = null;

// Subscribe to store updates
layersStore.subscribe((value) => {
	layers = value;
});

activeLayerStore.subscribe((value) => {
	activeLayerId = value;
});

// Initialize with default layer
export const initializeLayers = () => {
	if (paper.project && paper.project.layers.length > 0) {
		const defaultLayer = paper.project.activeLayer;
		const defaultLayerInfo: LayerInfo = {
			id: 'layer-1',
			name: 'Layer 1',
			layer: defaultLayer,
			visible: true,
			locked: false
		};
		
		defaultLayer.name = 'Layer 1';
		layers = [defaultLayerInfo];
		activeLayerId = 'layer-1';
		
		layersStore.set(layers);
		activeLayerStore.set(activeLayerId);
	}
};

// Create a new layer
export const createLayer = (name?: string) => {
	if (!paper.project) return null;
	
	const layerCount = layers.length + 1;
	const layerName = name || `Layer ${layerCount}`;
	const layerId = `layer-${layerCount}`;
	
	const newLayer = new paper.Layer();
	newLayer.name = layerName;
	newLayer.activate();
	
	const layerInfo: LayerInfo = {
		id: layerId,
		name: layerName,
		layer: newLayer,
		visible: true,
		locked: false
	};
	
	layers = [...layers, layerInfo];
	activeLayerId = layerId;
	
	layersStore.set(layers);
	activeLayerStore.set(activeLayerId);
	
	return layerInfo;
};

// Delete a layer
export const deleteLayer = (layerId: string) => {
	if (layers.length <= 1) return; // Keep at least one layer
	
	const layerIndex = layers.findIndex(l => l.id === layerId);
	if (layerIndex === -1) return;
	
	const layerToDelete = layers[layerIndex];
	
	// Remove all children first to ensure proper cleanup
	layerToDelete.layer.removeChildren();
	// Then remove the layer itself
	layerToDelete.layer.remove();
	
	layers = layers.filter(l => l.id !== layerId);
	
	// If we deleted the active layer, activate another one
	if (activeLayerId === layerId) {
		const newActiveIndex = Math.min(layerIndex, layers.length - 1);
		const newActiveLayer = layers[newActiveIndex];
		newActiveLayer.layer.activate();
		activeLayerId = newActiveLayer.id;
		activeLayerStore.set(activeLayerId);
	}
	
	// Force redraw
	paper.view.update();
	
	layersStore.set(layers);
};

// Select/activate a layer
export const selectLayer = (layerId: string) => {
	const layer = layers.find(l => l.id === layerId);
	if (!layer) return;
	
	layer.layer.activate();
	activeLayerId = layerId;
	activeLayerStore.set(activeLayerId);
};

// Rename a layer
export const renameLayer = (layerId: string, newName: string) => {
	const layer = layers.find(l => l.id === layerId);
	if (!layer) return;
	
	layer.name = newName;
	layer.layer.name = newName;
	
	layersStore.set([...layers]);
};

// Toggle layer visibility
export const toggleLayerVisibility = (layerId: string) => {
	const layer = layers.find(l => l.id === layerId);
	if (!layer) return;
	
	layer.visible = !layer.visible;
	layer.layer.visible = layer.visible;
	
	// Force redraw
	paper.view.update();
	
	layersStore.set([...layers]);
};

// Toggle layer lock
export const toggleLayerLock = (layerId: string) => {
	const layer = layers.find(l => l.id === layerId);
	if (!layer) return;
	
	layer.locked = !layer.locked;
	layer.layer.locked = layer.locked;
	
	// Also lock/unlock all children
	layer.layer.children.forEach((child: paper.Item) => {
		child.locked = layer.locked;
	});
	
	layersStore.set([...layers]);
};

// Reorder layers
export const moveLayer = (fromIndex: number, toIndex: number) => {
	if (fromIndex === toIndex) return;
	
	const newLayers = [...layers];
	const [movedLayer] = newLayers.splice(fromIndex, 1);
	newLayers.splice(toIndex, 0, movedLayer);
	
	// Update Paper.js layer order properly
	// We need to reorder all layers to maintain consistent z-order
	// First layer in array should be at the bottom, last should be on top
	newLayers.forEach((layerInfo, index) => {
		if (index === 0) {
			// First layer goes to the very bottom
			layerInfo.layer.sendToBack();
		} else {
			// Each subsequent layer goes above all previous layers
			layerInfo.layer.bringToFront();
		}
	});
	
	// Force redraw to show the new order
	paper.view.update();
	
	layers = newLayers;
	layersStore.set(layers);
};

// Get active layer info
export const getActiveLayer = (): LayerInfo | null => {
	return layers.find(l => l.id === activeLayerId) || null;
};

// Get layer by ID
export const getLayerById = (layerId: string): LayerInfo | null => {
	return layers.find(l => l.id === layerId) || null;
};

// Create a new layer for a new element and place it at the top (bottom of the list)
export const createLayerForNewElement = (elementName?: string) => {
	if (!paper.project) return null;
	
	const layerCount = layers.length + 1;
	const layerName = elementName || `Layer ${layerCount}`;
	const layerId = `layer-${Date.now()}`; // Use timestamp for unique ID
	
	const newLayer = new paper.Layer();
	newLayer.name = layerName;
	newLayer.activate();
	
	// Place new layer at the top (visually first)
	newLayer.bringToFront();
	
	const layerInfo: LayerInfo = {
		id: layerId,
		name: layerName,
		layer: newLayer,
		visible: true,
		locked: false
	};
	
	// Insert at the beginning of the array (top of the list, renders on top)
	layers = [layerInfo, ...layers];
	activeLayerId = layerId;
	
	layersStore.set(layers);
	activeLayerStore.set(activeLayerId);
	
	return layerInfo;
};

// Find which layer an item belongs to
export const findLayerForItem = (item: paper.Item): LayerInfo | null => {
	for (const layerInfo of layers) {
		if (layerInfo.layer.isChild(item) || layerInfo.layer === item.layer) {
			return layerInfo;
		}
	}
	return null;
};

// Select layer based on an item
export const selectLayerForItem = (item: paper.Item) => {
	const layerInfo = findLayerForItem(item);
	if (layerInfo) {
		selectLayer(layerInfo.id);
	}
}; 