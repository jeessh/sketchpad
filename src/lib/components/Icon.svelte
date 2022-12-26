<script>
	import { CursorIcon, HandIcon, PencilIcon } from '$lib/icons';

	export let name = '';
	export let width = '1rem';
	export let height = '1rem';
	let icons = [
		{
			box: 15,
			name: 'cursor',
			svg: CursorIcon
		},
		{
			box: 15,
			name: 'hand',
			svg: HandIcon
		},
		{
			box: 15,
			name: 'pencil',
			svg: PencilIcon
		}
	];
	let displayIcon = icons.find((e) => e.name === name);
</script>

<svg class={$$props.class} {width} {height} viewBox="0 0 {displayIcon?.box} {displayIcon?.box}"
	>{@html displayIcon?.svg}</svg
>
