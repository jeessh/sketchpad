<script lang="ts">
    import { onMount } from 'svelte';
    import { selectTool, pencilTool } from './tools';
    import paper from 'paper';
    
    let currentTool: paper.Tool;
    
    onMount(() => {
      // set initial tool
      currentTool = selectTool;
      currentTool.activate();
    });
    
    function activatePencil() {
      currentTool = pencilTool;
      currentTool.activate();
    }
    
    function activateSelect() {
      currentTool = selectTool;
      currentTool.activate();
    }
    
    function clear() {
      paper.project.activeLayer.removeChildren();
    }
  </script>
  
  <div class="toolbar">
    <button on:click={activateSelect}>Move</button>
    <button on:click={activatePencil}>Pencil</button>
    <button on:click={clear}>Clear</button>
    <!-- <SelectTool /> -->
  </div>
  
  <style>
    .toolbar {
      display: flex;
    }
  </style>