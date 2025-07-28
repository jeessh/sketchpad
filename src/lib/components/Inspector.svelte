<script lang="ts">
	import paper from 'paper';
	import ColorInput from './common/ColorInput.svelte';
	import Input from './common/Input.svelte';
	import VisibilityToggle from './common/VisibilityToggle.svelte';
	import {
		drawHighlight,
		selectedItemsStore,
		selectionBoundsStore
	} from '$lib/stores/layerStateStore';
	import OpacityInput from './common/OpacityInput.svelte';
	import { getFill, getStroke } from '$lib/util/properties';
	import LayerManager from './common/LayerManager.svelte';

	let fillVisible = true;
	let fillColor: paper.Color[] = [];
	let fillOpacity = 1.0;

	let strokeVisible = true;
	let strokeColor: paper.Color[] = [];
	let strokeOpacity = 1.0;

	let bounds: paper.Rectangle | undefined;
	selectionBoundsStore.subscribe((value) => {
		bounds = value;
	});

	// Helper functions to get opacity from selected items
	const getFillOpacity = (items: paper.Item[]): number => {
		if (items.length === 0) return 1.0;
		
		const firstOpacity = items[0].fillColor?.alpha ?? 1.0;
		const allSame = items.every((item) => {
			const itemOpacity = item.fillColor?.alpha ?? 1.0;
			return Math.abs(itemOpacity - firstOpacity) < 0.01; // Small tolerance for floating point comparison
		});
		
		return allSame ? firstOpacity : firstOpacity; // For mixed, we could return average or first item's value
	};

	const getStrokeOpacity = (items: paper.Item[]): number => {
		if (items.length === 0) return 1.0;
		
		const firstOpacity = items[0].strokeColor?.alpha ?? 1.0;
		const allSame = items.every((item) => {
			const itemOpacity = item.strokeColor?.alpha ?? 1.0;
			return Math.abs(itemOpacity - firstOpacity) < 0.01;
		});
		
		return allSame ? firstOpacity : firstOpacity;
	};

	let selectedItems = new Set<paper.Item>();
	selectedItemsStore.subscribe((value) => {
		selectedItems = value;
		fillColor = getFill(Array.from(value));
		strokeColor = getStroke(Array.from(value));
		fillOpacity = getFillOpacity(Array.from(value));
		strokeOpacity = getStrokeOpacity(Array.from(value));
	});

	const setFillColor = (color: paper.Color) => {
		selectedItems.forEach((item) => {
			item.fillColor = color;
		});
		fillColor = getFill(Array.from(selectedItems));
	};

	const setStrokeColor = (color: paper.Color) => {
		selectedItems.forEach((item) => {
			item.strokeColor = color;
		});
		strokeColor = getStroke(Array.from(selectedItems));
	};

	const setFillOpacity = (newOpacity: number) => {
		selectedItems.forEach((item) => {
			if (item.fillColor) {
				item.fillColor.alpha = newOpacity;
			}
		});
		fillOpacity = newOpacity;
		drawHighlight();
	};

	const setStrokeOpacity = (newOpacity: number) => {
		selectedItems.forEach((item) => {
			if (item.strokeColor) {
				item.strokeColor.alpha = newOpacity;
			}
		});
		strokeOpacity = newOpacity;
		drawHighlight();
	};

	const updateX = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const x = parseFloat(target.value);
		if (isNaN(x)) return;
		selectedItems.forEach((item) => {
			item.position.x = x + item.bounds.width / 2;
		});

		drawHighlight();
	};

	const updateY = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const y = parseFloat(target.value);
		if (isNaN(y)) return;
		selectedItems.forEach((item) => {
			item.position.y = y + item.bounds.height / 2;
		});

		drawHighlight();
	};

	const updateWidth = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const width = parseFloat(target.value);
		if (isNaN(width)) return;
		selectedItems.forEach((item) => {
			item.bounds.width = width;
		});

		drawHighlight();
	};

	const updateHeight = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const height = parseFloat(target.value);
		if (isNaN(height)) return;
		selectedItems.forEach((item) => {
			item.bounds.height = height;
		});

		drawHighlight();
	};

	// on key down, if the user presses enter, blur the input
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			const target = e.target as HTMLInputElement;
			target.blur();
		}
	};

	// shared keyboard handler for color and opacity inputs
	const handleColorOpacityKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === 'Escape') {
			const target = e.target as HTMLInputElement;
			target.blur();
		}
	};
</script>

<div class="inspector" on:keydown={(e) => e.stopPropagation()}>
	<div class="sections">
		<div class="section">
			<LayerManager />
		</div>
		{#if bounds}
			<div class="section">
				<div class="title">Transform</div>
				<div class="content">
					<div class="flex gap-4">
						<div class="w-1/2">
							<Input
								label="X"
								type="text"
								class="w-full"
								value={bounds?.x}
								onChange={updateX}
								onKeyDown={handleKeyDown}
							/>
						</div>
						<div class="w-1/2">
							<Input
								label="Y"
								type="text"
								class="w-full"
								value={bounds?.y}
								onChange={updateY}
								onKeyDown={handleKeyDown}
							/>
						</div>
					</div>
					<div class="flex gap-4">
						<div class="w-1/2">
							<Input
								label="W"
								type="text"
								class="w-full"
								value={bounds?.width}
								onChange={updateWidth}
								onKeyDown={handleKeyDown}
							/>
						</div>
						<div class="w-1/2">
							<Input
								label="H"
								type="text"
								class="w-full"
								value={bounds?.height}
								onChange={updateHeight}
								onKeyDown={handleKeyDown}
							/>
						</div>
					</div>
				</div>
			</div>
		{/if}
		<div class="section">
			<div class="title">Fill</div>
			<div class="content">
				<div class="flex">
					<div class="flex min-w-0">
						<ColorInput bind:color={fillColor} setColor={setFillColor} onKeyDown={handleColorOpacityKeyDown} />
						<div class="h-full w-px" style="background-color: #303437;" />
						<OpacityInput
							bind:opacity={fillOpacity}
							setOpacity={setFillOpacity}
							onKeyDown={handleColorOpacityKeyDown}
						/>
					</div>
					<div class="ml-1 h-full">
						<VisibilityToggle
							bind:visible={fillVisible}
							setVisible={(visible) => {
								fillVisible = visible;
							}}
						/>
					</div>
				</div>
			</div>
		</div>
		<div class="section">
			<div class="title">Stroke</div>
			<div class="content">
				<div class="flex">
					<div class="flex min-w-0">
						<ColorInput bind:color={strokeColor} setColor={setStrokeColor} onKeyDown={handleColorOpacityKeyDown} />
						<div class="h-full w-px" style="background-color: #303437;" />
						<OpacityInput
							bind:opacity={strokeOpacity}
							setOpacity={setStrokeOpacity}
							onKeyDown={handleColorOpacityKeyDown}
						/>
					</div>
					<div class="ml-1 h-full">
						<VisibilityToggle
							bind:visible={strokeVisible}
							setVisible={(visible) => {
								strokeVisible = visible;
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:root {
		user-select: none;
	}

	.inspector {
		background-color: #232323;
		color: white;
		height: 100%;
		width: 250px;
		border: 1px solid #303437;
		padding: 16px;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.sections {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.title {
		margin-bottom: 8px;
	}
</style>
