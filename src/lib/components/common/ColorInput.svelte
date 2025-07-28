<script lang="ts">
	import paper, { Color } from 'paper';
	import Input from './Input.svelte';

	export let color: paper.Color[];
	export let setColor: (arg0: paper.Color) => void;
	export let onKeyDown: ((e: KeyboardEvent) => void) | undefined = undefined;

	// if all colors are the same, return that color
	// otherwise, return "Mixed"
	$: getColorString = () => {
		if (color.length === 0) return undefined;

		const firstColor = color[0];
		if (color.every((c) => c && c.equals(firstColor))) {
			return firstColor.toCSS(true);
		}

		return 'Mixed';
	};

	$: colorString = getColorString();
	$: displayColor = colorString === undefined ? 'None' : colorString;
	
	// For the color input, we need a separate value that can be bound
	$: colorPickerValue = colorString && colorString !== 'Mixed' ? colorString : '#000000';

	function handleColorPickerChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const newColor = new Color(target.value);
		setColor(newColor);
	}

    function checkAndSetColor(e: Event) {
        const target = e.target as HTMLInputElement;
        let inputColor = target.value;

        // if starts with #, remove it
        if (inputColor.startsWith('#')) {
            inputColor = inputColor.slice(1);
        }

        // if inputColor is not 6 digits, repeat until it is
        if (inputColor.length !== 6) {
            while (inputColor.length < 6) {
                inputColor += inputColor;
            }
            inputColor = inputColor.slice(0, 6);
        }

        const newColor = new Color(`#${inputColor}`);
        setColor(newColor);
    }

	function handleTextInputFocus(e: Event) {
		const target = e.target as HTMLInputElement;
		target.select();
	}
</script>

<div class="wrapper">
	<input
		type="color"
		value={colorPickerValue}
		on:input={handleColorPickerChange}
	/>
	<Input
		type="text"
		bind:value={displayColor}
		onFocus={handleTextInputFocus}
        onChange={checkAndSetColor}
		onKeyDown={onKeyDown}
	/>
</div>

<style>
	.wrapper {
		flex-grow: 1;
		min-width: 0;
		position: relative;
	}
	input[type='color'] {
		position: absolute;
		left: 0;
		background: none;
		border-radius: 2px;
		border-width: 0;
		width: 34px;
		padding: 6px;
		height: 100%;
	}

	input[type='color']::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	input[type='color']::-webkit-color-swatch {
		border-radius: 4px;
		border-width: 0;
	}

	.wrapper :global(input[type='text']) {
		padding: 8px 8px;
		padding-left: 35px;
		border-top-right-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}
</style>
