<script type="ts">
	import ColorInput from './common/ColorInput.svelte';
	import Input from './common/Input.svelte';
	import VisibilityToggle from './common/VisibilityToggle.svelte';

	let fillVisible = true;
    let color = '#000000';
</script>

<div class="inspector">
    <div class="sections">
        <div class="section">
            <div class="title">Position and Size</div>
            <div class="content">
                <div class="row">
                    <div class="bg-red-100">
                        <Input label="X" type="text" />
                    </div>
                    <div class="col-1-2">b</div>
                    <!-- <Input label="Y" type="text" /> -->
                </div>
            </div>
        </div>
        <div class="section">
            <div class="title">Fill</div>
            <div class="content">
                <div class="row">
                    <ColorInput bind:color={color} setColor={(newColor) => color = newColor} />
                    <VisibilityToggle bind:visible={fillVisible} setVisible={(visible) => {
                        fillVisible = visible
                    }} />
                </div>
            </div>
        </div>
    </div>
</div>

<style>
	.inspector {
		background-color: #232323;
		color: white;
		height: 100%;
		width: 200px;
		border: 1px solid #303437;
		padding: 16px;
	}

    .sections {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

	.title {
		margin-bottom: 8px;
	}

	.row {
		display: flex;
        flex-basis: 0;
		gap: 8px;
	}

    .col-1-2 {
        width: 50%;
    }
</style>
