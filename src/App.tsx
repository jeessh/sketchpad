import Canvas from '$lib/components/Canvas';
import Inspector from '$lib/components/Inspector';
import Toolbar from '$lib/components/Toolbar';

const App = () => {
	return (
		<div className="app-root">
			<Toolbar />
			<main className="app-main">
				<Canvas />
				<Inspector />
			</main>
		</div>
	);
};

export default App;
