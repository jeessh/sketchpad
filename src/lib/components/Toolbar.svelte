<script lang="ts">
    import { onMount } from 'svelte';
    import { selectTool, pencilTool, panTool } from './tools';
    import { setCursor } from '$lib/util/cursor';
    import paper from 'paper';
    
    let currentTool: paper.Tool;
    
    onMount(() => {
      // set initial tool
      currentTool = selectTool;
      currentTool.activate();
    });
    
    function activatePencil() {
      currentTool = pencilTool;
      setCursor('crosshair');
      currentTool.activate();
    }
    
    function activateSelect() {
      currentTool = selectTool;
      setCursor('default')
      currentTool.activate();
    }

    function activatePan() {
      currentTool = panTool;
      setCursor('grab');
      currentTool.activate();
    }
    
    function clear() {
      paper.project.activeLayer.removeChildren();
    }
  </script>
  
  <div class="toolbar">
    <button on:click={activateSelect}>Move</button>
    <button on:click={activatePan}>Pan</button>
    <button on:click={activatePencil}>Pencil</button>
    <button on:click={clear}>Clear</button>
  </div>
  
  <style>
    .toolbar {
      display: flex;
    }
  </style>