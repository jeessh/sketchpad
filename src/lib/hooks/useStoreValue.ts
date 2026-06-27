import { useEffect, useState } from 'react';
import type { Writable } from '$lib/stores/simpleStore';

export const useStoreValue = <T>(store: Writable<T>): T => {
	const [value, setValue] = useState(() => store.get());

	useEffect(() => store.subscribe(setValue), [store]);

	return value;
};
