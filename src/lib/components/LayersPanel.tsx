import { useRef } from 'react';
import paper from 'paper';
import { useStoreValue } from '$lib/hooks/useStoreValue';
import {
  layersStore,
  renameLayer,
  toggleLayerVisibility,
  reorderLayer,
  deleteLayer,
} from '$lib/stores/layersStore';
import {
  selectedItemsStore,
  selectObject,
  unselectAll,
} from '$lib/stores/layerStateStore';
import LayerRow from '$lib/components/LayerRow';

const LayersPanel = () => {
  const layers = useStoreValue(layersStore);
  const selectedItems = useStoreValue(selectedItemsStore);
  const selectedIds = new Set(Array.from(selectedItems).map((i) => i.id));
  const dragSourceId = useRef<number | null>(null);

  const handleSelect = (id: number) => {
    const item = paper.project.getItem({ id });
    if (!item) return;
    unselectAll();
    selectObject(item);
  };

  const handleDragStart = (id: number) => {
    dragSourceId.current = id;
  };

  const handleDrop = (toId: number, position: 'above' | 'below') => {
    if (dragSourceId.current === null) return;
    reorderLayer(dragSourceId.current, toId, position);
    dragSourceId.current = null;
  };

  return (
    <div className="section">
      <div className="title">Layers</div>
      <div className="content">
        {layers.map((layer) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            isSelected={selectedIds.has(layer.id)}
            onSelect={handleSelect}
            onRename={renameLayer}
            onVisibilityToggle={toggleLayerVisibility}
            onDelete={deleteLayer}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
};

export default LayersPanel;
