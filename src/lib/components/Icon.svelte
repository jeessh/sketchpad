<script>
	import {
		CursorIcon,
		HandIcon,
		PencilIcon,
		EyeOpenIcon,
		EyeClosedIcon,
		SquareIcon
	} from '$lib/icons';

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
		},
		{
			box: 15,
			name: 'eye-open',
			svg: EyeOpenIcon
		},
		{
			box: 15,
			name: 'eye-closed',
			svg: EyeClosedIcon
		},
		{
			box: 15,
			name: 'square',
			svg: SquareIcon
		}
	];
	$: displayIcon = icons.find((e) => e.name === name);
</script>

<svg class={$$props.class} {width} {height} viewBox="0 0 {displayIcon?.box} {displayIcon?.box}"
	>{@html displayIcon?.svg}</svg
>

<style>
	svg {
		display: block;
	}
</style>
