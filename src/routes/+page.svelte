<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte'
	import Toolbar from '$lib/components/Toolbar.svelte'
</script>

<div id="root">
	<Toolbar />
	<Canvas />
</div>

<style>
	#root {
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
</style>
