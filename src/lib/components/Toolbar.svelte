<script lang="ts">
    import { onMount } from 'svelte';
    import { setCurrentTool } from '$lib/stores/globalStateStore';
    import paper from 'paper';
    
    onMount(() => {
      // set initial tool
      setCurrentTool('select');
    });
    
    function activatePencil() {
      setCurrentTool('pencil');
    }
    
    function activateSelect() {
      setCurrentTool('select');
    }

    function activatePan() {
      setCurrentTool('pan');
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