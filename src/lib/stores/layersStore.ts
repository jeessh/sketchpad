import paper from 'paper';
import { writable } from '$lib/stores/simpleStore';

export interface LayerItem {
  id: number;
  name: string;
  visible: boolean;
}

export const layersStore = writable<LayerItem[]>([]);

function defaultNameForType(item: paper.Item): string {
  if (item instanceof paper.Path) {
    if ((item as paper.Path).segments.length === 4) return 'Rectangle';
    return 'Path';
  }
  if (item instanceof paper.Group) return 'Group';
  return 'Shape';
}

export function refreshLayers(): void {
  const children = paper.project.activeLayer.children;
  const items = [...children]
    .reverse()
    .filter((item) => !item.data.internal);
  layersStore.set(
    items.map((item) => ({
      id: item.id,
      name: item.data.name ?? defaultNameForType(item),
      visible: item.visible,
    }))
  );
}

export function renameLayer(id: number, name: string): void {
  const item = paper.project.getItem({ id });
  if (!item) return;
  item.data.name = name;
  refreshLayers();
}

export function toggleLayerVisibility(id: number): void {
  const item = paper.project.getItem({ id });
  if (!item) return;
  if (item.visible) {
    item.data._savedFillColor = item.fillColor ? item.fillColor.clone() : null;
    item.data._savedStrokeColor = item.strokeColor ? item.strokeColor.clone() : null;
    item.visible = false;
  } else {
    item.visible = true;
    if ('_savedFillColor' in item.data) {
      item.fillColor = item.data._savedFillColor ?? null;
    }
    if ('_savedStrokeColor' in item.data) {
      item.strokeColor = item.data._savedStrokeColor ?? null;
    }
  }
  refreshLayers();
}

export function reorderLayer(fromId: number, toId: number, position: 'above' | 'below'): void {
  const fromItem = paper.project.getItem({ id: fromId });
  const toItem = paper.project.getItem({ id: toId });
  if (!fromItem || !toItem || fromId === toId) return;
  // In Paper.js, insertAbove(toItem) places fromItem visually on top of toItem.
  // The Layers panel shows topmost-first, so "drop above row" = higher z = insertAbove.
  if (position === 'above') {
    fromItem.insertAbove(toItem);
  } else {
    fromItem.insertBelow(toItem);
  }
  refreshLayers();
}

export function deleteLayer(id: number): void {
  const item = paper.project.getItem({ id });
  if (!item) return;
  item.remove();
  refreshLayers();
}
