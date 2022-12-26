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
                <div class="flex gap-4">
                    <div class="w-1/2">
                        <Input label="X" type="text" class="w-full" />
                    </div>
                    <div class="w-1/2">
                        <Input label="Y" type="text" class="w-full" />
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="w-1/2">
                        <Input label="W" type="text" class="w-full" />
                    </div>
                    <div class="w-1/2">
                        <Input label="H" type="text" class="w-full" />
                    </div>
                </div>
            </div>
        </div>
        <div class="section">
            <div class="title">Fill</div>
            <div class="content">
                <div class="flex">
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
		width: 250px;
		border: 1px solid #303437;
		padding: 16px;
	}

    .content {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .sections {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

	.title {
		margin-bottom: 8px;
	}
</style>
