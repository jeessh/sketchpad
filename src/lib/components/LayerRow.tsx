import { useEffect, useRef, useState } from 'react';
import Icon from '$lib/components/Icon';
import type { LayerItem } from '$lib/stores/layersStore';

interface LayerRowProps {
  layer: LayerItem;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onRename: (id: number, name: string) => void;
  onVisibilityToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onDragStart: (id: number) => void;
  onDrop: (toId: number, position: 'above' | 'below') => void;
}

const DragHandleIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <rect y="1" width="10" height="1.5" rx="0.75" />
    <rect y="4.25" width="10" height="1.5" rx="0.75" />
    <rect y="7.5" width="10" height="1.5" rx="0.75" />
  </svg>
);

const LayerRow = ({
  layer,
  isSelected,
  onSelect,
  onRename,
  onVisibilityToggle,
  onDelete,
  onDragStart,
  onDrop,
}: LayerRowProps) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(layer.name);
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(layer.name);
    setEditing(true);
  };

  const commitEdit = () => {
    setEditing(false);
    const trimmed = editValue.trim();
    onRename(layer.id, trimmed || layer.name);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    setDropPosition(e.clientY < mid ? 'above' : 'below');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(layer.id, dropPosition ?? 'above');
    setDropPosition(null);
  };

  const classNames = [
    'layer-row',
    isSelected ? 'layer-row--selected' : '',
    dropPosition ? `layer-row--drop-${dropPosition}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      draggable
      onClick={() => onSelect(layer.id)}
      onDragStart={() => onDragStart(layer.id)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={() => setDropPosition(null)}
    >
      <div className="layer-row__handle">
        <DragHandleIcon />
      </div>

      {editing ? (
        <input
          ref={inputRef}
          className="layer-row__name-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') {
              setEditValue(layer.name);
              setEditing(false);
            }
          }}
        />
      ) : (
        <span className="layer-row__name" onDoubleClick={startEdit}>
          {layer.name}
        </span>
      )}

      <button
        type="button"
        className="layer-row__visibility"
        title={layer.visible ? 'Hide' : 'Show'}
        onClick={(e) => {
          e.stopPropagation();
          onVisibilityToggle(layer.id);
        }}
      >
        <Icon name={layer.visible ? 'eye-open' : 'eye-closed'} />
      </button>

      <button
        type="button"
        className="layer-row__delete"
        title="Delete layer"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(layer.id);
        }}
      >
        ×
      </button>
    </div>
  );
};

export default LayerRow;
