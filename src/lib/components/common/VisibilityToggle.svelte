<script>
    import { afterUpdate } from "svelte";
	import Icon from "$lib/components/Icon.svelte";


    /**
	 * @type {boolean}
	 */
     export let visible;
     $: name = visible ? "eye-open" : "eye-closed";

     /**
	 * @type {(arg0: boolean) => any}
	 */
      export let setVisible;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="wrapper" on:click={() => setVisible(!visible)}>
    <Icon {name} />
</div>

<style lang="scss">
    .wrapper {
        padding: 8px;
        border-radius: 8px;

        &:hover {
            background-color: #303437;
        }
    }
</style>

