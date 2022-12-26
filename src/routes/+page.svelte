<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte'
	import Toolbar from '$lib/components/Toolbar.svelte'
	import Inspector from '$lib/components/Inspector.svelte';
</script>

<div id="root">
	<Toolbar />
	<main>
		<Canvas />
		<Inspector />
	</main>
</div>

<style>
	#root {
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	main {
		display: flex;
		height: 100%;
	}
</style>
