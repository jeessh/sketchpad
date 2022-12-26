<script type="ts">
	import ColorInput from './common/ColorInput.svelte';
	import Input from './common/Input.svelte';
	import VisibilityToggle from './common/VisibilityToggle.svelte';

	let fillVisible = true;
    let color = '#000000';
</script>

<div class="inspector">
	<div class="section">
		<div class="title">Fill</div>
		<div class="content">
			<div class="row">
				<ColorInput bind:color={color} setColor={(newColor) => color = newColor} />
				<VisibilityToggle bind:visible={fillVisible} setVisible={(visible) => {
                    fillVisible = visible
                }} />
			</div>
		</div>
	</div>
</div>

<style>
	.inspector {
		background-color: #232323;
		color: white;
		height: 100%;
		width: 200px;
		border: 1px solid #303437;
		padding: 16px;
	}

	.title {
		margin-bottom: 8px;
	}

	.row {
		display: flex;
		gap: 8px;
	}

	input[type='color'] {
		-webkit-appearance: none;
		background: none;
		border-radius: 8px;
		border-width: 0;
		width: 20px;
		height: 20px;
	}

	input[type='color']::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	input[type='color']::-webkit-color-swatch {
		border-radius: 4px;
		border-width: 0;
	}
</style>
