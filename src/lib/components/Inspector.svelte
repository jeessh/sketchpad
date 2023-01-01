<script lang="ts">
	import paper from 'paper';
	import ColorInput from './common/ColorInput.svelte';
	import Input from './common/Input.svelte';
	import VisibilityToggle from './common/VisibilityToggle.svelte';
	import { drawHighlight, selectedItemsStore, selectionBoundsStore } from '$lib/stores/layerStateStore';
	import OpacityInput from './common/OpacityInput.svelte';

	let bounds: paper.Rectangle | undefined;
	selectionBoundsStore.subscribe((value) => {
		bounds = value;
	});

	let selectedItems = new Set<paper.Item>();
	selectedItemsStore.subscribe((value) => {
		selectedItems = value;
	});

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

	let fillVisible = true;
	let fillColor = '#000000';
	let fillOpacity = 1.0;

	let strokeVisible = true;
	let strokeColor = '#000000';
	let strokeOpacity = 1.0;
</script>

<div class="inspector">
	<div class="sections">
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
						<ColorInput bind:color={fillColor} setColor={(newColor) => (fillColor = newColor)} />
						<div class="h-full w-px" style="background-color: #303437;"/>
						<OpacityInput bind:opacity={fillOpacity} setOpacity={(newOpacity) => fillOpacity = newOpacity} />
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
						<ColorInput bind:color={strokeColor} setColor={(newColor) => (strokeColor = newColor)} />
						<div class="h-full w-px" style="background-color: #303437;"/>
						<OpacityInput bind:opacity={strokeOpacity} setOpacity={(newOpacity) => strokeOpacity = newOpacity} />
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
