export type Unsubscriber = () => void;
export type Subscriber<T> = (value: T) => void;

export interface Writable<T> {
	set(value: T): void;
	update(updater: (value: T) => T): void;
	subscribe(run: Subscriber<T>): Unsubscriber;
	get(): T;
}

export const writable = <T>(initialValue: T): Writable<T> => {
	let value = initialValue;
	const subscribers = new Set<Subscriber<T>>();

	return {
		set(nextValue) {
			if (Object.is(value, nextValue)) return;
			value = nextValue;
			subscribers.forEach((subscriber) => subscriber(value));
		},
		update(updater) {
			this.set(updater(value));
		},
		subscribe(run) {
			subscribers.add(run);
			run(value);
			return () => subscribers.delete(run);
		},
		get() {
			return value;
		}
	};
};

export const get = <T>(store: Writable<T>): T => store.get();
