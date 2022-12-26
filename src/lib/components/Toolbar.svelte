<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang="ts">
	import { setCurrentTool, currentTool, getCurrentTool, type TTool } from '$lib/stores/globalStateStore';
	import Icon from '$lib/components/Icon.svelte';
	import paper from 'paper';

	function clear() {
		paper.project.activeLayer.removeChildren();
	}

	let activeTool = getCurrentTool();
    currentTool.subscribe((value: TTool) => {
        activeTool = value;
    });
</script>

<div class="toolbar">
    <div class="tool" class:active={activeTool === 'select'} on:click={() => setCurrentTool('select')}>
        <Icon height="15" width="15" name="cursor" class="block" />
    </div>
    <div class="tool" class:active={activeTool === 'pan'} on:click={() => setCurrentTool('pan')}>
        <Icon height="15" width="15" name="hand" class="block" />
    </div>
    <div class="tool" class:active={activeTool === 'pencil'} on:click={() => setCurrentTool('pencil')}>
        <Icon height="15" width="15" name="pencil" class="block" />
    </div>
    <!-- <div class="tool" on:click={clear}>Clear</div> -->
</div>

<style>
	.toolbar {
		display: flex;
        background: #232323;
        padding: 8px;
        gap: 4px;
        user-select: none;
	}

	.tool {
        padding: 8px;
        border-radius: 8px;
        background: transparent;
        color: white;
	}

    .tool:hover {
        background-color: #303437;
    }

	.tool.active {
		background-color: #1D71AE;
	}

    .tool :global(.block) {
        display: block;
    }
</style>
