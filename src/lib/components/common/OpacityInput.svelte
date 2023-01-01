<script lang="ts">
	import Input from './Input.svelte';

	$: ({ opacity, setOpacity, ...inputProps } = $$props);

	$: displayOpacity = `${Math.round(opacity * 100)}%`;

	const updateOpacity = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const opacity = parseFloat(target.value) / 100;
		if (isNaN(opacity)) return;
		setOpacity(opacity);
	};
</script>

<div id="wrapper" class="min-w-0" style="flex-basis: 100px;">
	<Input
		type="text"
		value={displayOpacity}
		onChange={updateOpacity}
		onFocus={(e) => {
			e.target.select();
		}}
		{...inputProps}
	/>
</div>

<style>
	#wrapper :global(input) {
		border-top-left-radius: 0 !important;
		border-bottom-left-radius: 0 !important;
	}
</style>