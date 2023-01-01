<script lang="ts">
	import Input from "./Input.svelte";

    export let color: string;
    export let setColor: (arg0: string) => any;
</script>

<div class="wrapper">
    <input type="color" value={color} on:input={(e) => setColor(e.target?.value)} />
    <Input type="text" value={color} onFocus={(e) => e.target.select()} />
</div>

<style>
    .wrapper {
        flex-grow: 1;
        min-width: 0;
        position: relative;
    }
    input[type='color'] {
        position: absolute;
        left: 0;
        background: none;
        border-radius: 2px;
        border-width: 0;
        width: 34px;
        padding: 6px;
        height: 100%;
    }

    input[type='color']::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    input[type='color']::-webkit-color-swatch {
        border-radius: 4px;
        border-width: 0;
    }

    .wrapper :global(input[type="text"]) {
        padding: 8px 8px;
        padding-left: 35px;
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
    }
</style>