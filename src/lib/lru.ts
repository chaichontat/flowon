import { isEqual } from 'lodash-es';
import LRU from 'lru-cache';

export function genLRU<T, K extends Exclude<T, unknown[]>[], V>(
	f: (...args: K) => V,
	max = 100
): (...args: K) => V {
	const cache = new LRU<string, V>({ max });
	return (...args: K): V => {
		const key = JSON.stringify(args);
		if (cache.has(key)) return cache.get(key) as V; // Checked
		const r = f(...args);
		cache.set(key, r);
		return r;
	};
}

/**
 * Decorates a function with an LRU with a cache size of 1.
 * Mainly to prevent state change functions from being called when the state is the same.
 */
export function oneLRU<P, T extends Exclude<P, unknown[]>[], R>(
	f: (...args: T) => R
): (...args: T) => R {
	let lastArgs: T;
	let lastResult: R;
	return (...args: T): R => {
		if (args.some((a) => Array.isArray(a))) {
			throw new Error(`doNotRepeat: args must not be arrays.`);
		}
		if (lastArgs && isEqual(lastArgs, args)) return lastResult;
		const newResult = f(...args);
		// if (newResult !== false) {
		lastArgs = args;
		lastResult = newResult;
		// }
		return lastResult;
	};
}
