<script>
	// @ts-nocheck

	let inputProps;
	$: ({ label, ...inputProps } = $$props);
</script>

<div class="input-group">
    {#if label}
        <label for={inputProps.id}>{label}</label>
    {/if}
	<input {...inputProps} />
</div>

<style lang="scss">
    .input-group {
        display: flex;
        align-items: center;
        // flex-direction: column;
        gap: 8px;
    }

	input[type='text'] {
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
