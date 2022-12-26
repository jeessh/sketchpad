<script>
// @ts-nocheck

  let inputProps;
  $: ({ ...inputProps } = $$props);
</script>

<div>
  <input {...inputProps} />
</div>

<style lang="scss">
    input[type='text'] {
		border: 1px solid transparent;
        border-radius: 8px;
		background-color: #2B2B2B;
		color: white;
		padding: 8px 8px;
        outline: none;

        &:focus {
            border: 1px solid #1D71AE;
        }
	}
</style>