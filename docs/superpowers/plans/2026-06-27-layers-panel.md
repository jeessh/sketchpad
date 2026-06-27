# Layers Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Layers panel to the Inspector that displays all canvas items as draggable, renameable rows with per-item visibility toggles, synced to Paper.js z-order.

**Architecture:** A new `layersStore` holds an ordered `LayerItem[]` (topmost first) derived from `paper.project.activeLayer.children`. Tools call `refreshLayers()` after creating/deleting items. React renders the list via two new components (`LayersPanel`, `LayerRow`) placed at the top of the existing Inspector. Drag-and-drop uses the native HTML5 Drag API.

**Tech Stack:** React 19, Paper.js 0.12.17, Tailwind CSS, custom pub/sub stores (`writable<T>`)

## Global Constraints

- Follow existing store pattern: `writable<T>` from `src/lib/stores/simpleStore.ts`
- Use `$lib` path alias for all internal imports
- Dark theme: `#232323` bg, `#303437` borders, `#1d71ae` blue accent, `#2b2b2b` input bg, white text
- `item.data.internal = true` marks UI-only items — never show these in the Layers panel
- No new npm dependencies
- All new CSS classes go in `src/app.css`
- New layers appear at the top of the Layers panel (topmost z-order = first row)
- Two layers may share the same name; they must always have distinct `LayerItem.id` values (Paper.js `item.id` is globally unique — do not derive id from name)
- Reordering rows must update the actual Paper.js z-order: topmost row = highest z-order (`bringToFront` equivalent); order must survive selection changes and panel re-renders
- All per-item state (name, visibility, saved colors) must persist across drag-reorder operations — reordering moves items, not data
- LayerRow must include a delete button that removes the item from the canvas and from the Layers panel

---

## File Structure

| File | Status | Responsibility |
|------|--------|----------------|
| `src/lib/stores/layersStore.ts` | **Create** | Ordered layer list store + all mutation functions |
| `src/lib/components/LayersPanel.tsx` | **Create** | Section container, drag coordination, store subscriptions |
| `src/lib/components/LayerRow.tsx` | **Create** | Per-row render: drag handle, name (editable), visibility toggle, delete button |
| `src/lib/components/tools/rectangleTool.ts` | **Modify** | Call `refreshLayers()` after item creation |
| `src/lib/components/tools/pencilTool.ts` | **Modify** | Call `refreshLayers()` after item creation |
| `src/lib/components/tools/selectTool.ts` | **Modify** | Call `refreshLayers()` after item deletion |
| `src/lib/components/Inspector.tsx` | **Modify** | Add `<LayersPanel />` at top of `.sections` |
| `src/app.css` | **Modify** | Add `.layer-row*` CSS classes |

---

## Task 1: Create `layersStore.ts`

**Files:**
- Create: `src/lib/stores/layersStore.ts`

**Interfaces:**
- Produces:
  - `interface LayerItem { id: number; name: string; visible: boolean; }`
  - `layersStore: Writable<LayerItem[]>`
  - `refreshLayers(): void`
  - `renameLayer(id: number, name: string): void`
  - `toggleLayerVisibility(id: number): void`
  - `reorderLayer(fromId: number, toId: number, position: 'above' | 'below'): void`
  - `deleteLayer(id: number): void`

- [ ] **Step 1: Create the file with full implementation**

```ts
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
    item.fillColor = item.data._savedFillColor ?? null;
    item.strokeColor = item.data._savedStrokeColor ?? null;
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
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /Users/jwork/Development/sketchpad && npx tsc --noEmit`
Expected: No errors related to `layersStore.ts`

---

## Task 2: Wire `refreshLayers()` into tools

**Files:**
- Modify: `src/lib/components/tools/rectangleTool.ts`
- Modify: `src/lib/components/tools/pencilTool.ts`
- Modify: `src/lib/components/tools/selectTool.ts`

**Consumes:** `refreshLayers` from `$lib/stores/layersStore`

- [ ] **Step 1: Add import to each tool file**

In each file, add at the top:
```ts
import { refreshLayers } from '$lib/stores/layersStore';
```

- [ ] **Step 2: Call `refreshLayers()` in `rectangleTool.ts` after item is committed**

Find the `onMouseUp` handler. After `selectObject(path)` and `setCurrentTool('select')`, add:
```ts
refreshLayers();
```

- [ ] **Step 3: Call `refreshLayers()` in `pencilTool.ts` after drawing ends**

Find the `onMouseUp` handler. At the end of the handler body, add:
```ts
refreshLayers();
```

- [ ] **Step 4: Call `refreshLayers()` in `selectTool.ts` after item deletion**

Find the `onKeyDown` handler's backspace branch. After `drawHighlight()`, add:
```ts
refreshLayers();
```

- [ ] **Step 5: Verify by running the dev server**

Run: `cd /Users/jwork/Development/sketchpad && npm run dev`
Open the app, draw a rectangle. Open the browser console and run:
```js
// Check store value via window — or just observe the Layers panel once it's wired in Task 5
```
Expected: No runtime errors in console when drawing shapes.

---

## Task 3: Create `LayerRow.tsx`

**Files:**
- Create: `src/lib/components/LayerRow.tsx`

**Consumes:**
- `LayerItem` from `$lib/stores/layersStore`
- `Icon` from `$lib/components/Icon`

**Produces:** `LayerRow` component with props as defined below. Includes a delete button (trash/×) alongside the visibility toggle.

- [ ] **Step 1: Create the file**

```tsx
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
            if (e.key === 'Escape') setEditing(false);
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
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors in `LayerRow.tsx`

---

## Task 4: Create `LayersPanel.tsx`

**Files:**
- Create: `src/lib/components/LayersPanel.tsx`

**Consumes:**
- `layersStore`, `renameLayer`, `toggleLayerVisibility`, `reorderLayer`, `deleteLayer` from `$lib/stores/layersStore`
- `selectedItemsStore`, `selectObject`, `unselectAll` from `$lib/stores/layerStateStore`
- `useStoreValue` from `$lib/hooks/useStoreValue`
- `LayerRow` from `$lib/components/LayerRow`
- `paper` from `paper`

- [ ] **Step 1: Create the file**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors in `LayersPanel.tsx`

---

## Task 5: Integrate into `Inspector.tsx`

**Files:**
- Modify: `src/lib/components/Inspector.tsx`

**Consumes:** `LayersPanel` from `$lib/components/LayersPanel`

- [ ] **Step 1: Add import at the top of Inspector.tsx**

After the existing imports, add:
```tsx
import LayersPanel from '$lib/components/LayersPanel';
```

- [ ] **Step 2: Add `<LayersPanel />` as the first child of `.sections`**

In the JSX, find `<div className="sections">` and add `<LayersPanel />` as the first child, before the `{bounds ? ...}` block:

```tsx
<div className="sections">
  <LayersPanel />
  {bounds ? (
    ...
  ) : null}
  ...
```

- [ ] **Step 3: Start the dev server and verify**

Run: `npm run dev`
Expected: "Layers" section appears at the top of the Inspector panel. Empty when canvas is empty.

---

## Task 6: Add CSS to `app.css`

**Files:**
- Modify: `src/app.css`

- [ ] **Step 1: Append layer row styles to the end of `app.css`**

```css
.layer-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  user-select: none;
  position: relative;
}

.layer-row:hover {
  background-color: #2b2b2b;
}

.layer-row--selected {
  background-color: #1d3a5a;
  border-color: #1d71ae;
}

.layer-row__handle {
  color: #666;
  cursor: grab;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 2px;
}

.layer-row__handle:hover {
  color: #999;
}

.layer-row__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.layer-row__name-input {
  flex: 1;
  min-width: 0;
  border: 1px solid #1d71ae;
  border-radius: 4px;
  background: #2b2b2b;
  color: white;
  padding: 1px 4px;
  font-size: 13px;
  outline: none;
}

.layer-row__visibility {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: white;
  cursor: pointer;
}

.layer-row__visibility:hover {
  background-color: #303437;
}

.layer-row--drop-above::before,
.layer-row--drop-below::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #1d71ae;
  border-radius: 1px;
}

.layer-row--drop-above::before {
  top: -1px;
}

.layer-row--drop-below::after {
  bottom: -1px;
}

.layer-row__delete {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 5px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #b3b3b3;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.layer-row__delete:hover {
  background-color: #5a1d1d;
  color: #ff6b6b;
}
```

- [ ] **Step 2: Visually verify all states in the browser**

Check:
- Default row renders (handle, name, eye icon, × delete button)
- Hovered row: `#2b2b2b` background
- Selected row: blue border + dark blue background
- Drop-above: blue line appears above the hovered row
- Drop-below: blue line appears below the hovered row
- Hidden item: eye-closed icon shows, row name remains
- Clicking × deletes the item from canvas and removes the row
- Two rectangles with the same name have separate rows and separate IDs
- After dragging to reorder, the topmost row is drawn in front on canvas

---

## Verification

**End-to-end manual test sequence:**

1. Draw rectangle A → "Rectangle" row appears in Layers panel
2. Draw rectangle B on top of A → "Rectangle" row appears above "Rectangle" in panel (B is topmost)
3. Click B's row → B selected on canvas (blue border), row highlighted in panel
4. Drag A's row above B → A is now visually in front on canvas; row order updates
5. Double-click A's row name → type "My Rect" → Enter → name persists as "My Rect"
6. Click eye icon on B → B disappears from canvas, eye-closed icon in row
7. Click eye icon on B again → B reappears with original colors
8. Select B on canvas → B's row highlights in panel
9. Press Backspace to delete B → B's row disappears from panel
10. Draw a pencil path → "Path" row appears in Layers panel
11. Existing Inspector features (fill, stroke, transform) still work correctly
12. Draw two rectangles with no rename → both named "Rectangle" but with different IDs — each row is independently selectable, deletable, and renameable
13. Rename A to "My Rect", drag-reorder it — name "My Rect" persists after reorder
14. Hide A via eye toggle, drag-reorder A — A stays hidden after reorder; showing it restores original colors
15. Click × on a layer row → item removed from canvas and row removed from panel; other rows unaffected
