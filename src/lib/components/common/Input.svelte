<script>
	// @ts-nocheck

	let inputProps;
	let labelWidth = ''; // default value for label width
	$: ({ label, onChange, onKeyDown, onKeyUp, onKeyPress, onFocus, style, ...inputProps } = $$props);

	$: if (label) {
		const str = label.toString();
		labelWidth = 'width: ' + str.length + 'ch'; // calculate label width based on number of characters in label
	}
</script>

<div class="input-group" {style}>
	{#if label}
		<label for={inputProps.id} style={labelWidth}>{label}</label>
	{/if}
	<input
		on:change={onChange}
		on:keydown={onKeyDown}
		on:keyup={onKeyUp}
		on:keypress={onKeyPress}
		on:focus={onFocus}
		{...inputProps}
	/>
</div>

<style lang="scss">
	.input-group {
		min-width: 0;
		display: flex;
		align-items: center;
		// flex-direction: column;
		gap: 8px;
	}

	label {
		color: #b3b3b3;
	}

	input {
		min-width: 0;
		border: 1px solid transparent;
		border-radius: 8px;
		background-color: #2b2b2b;
		color: white;
		padding: 8px 8px;
		outline: none;

		&:focus {
			border: 1px solid #1d71ae;
		}
	}
</style>
