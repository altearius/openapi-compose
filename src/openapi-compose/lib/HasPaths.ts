import type IHasPaths from './IHasPaths.js';

export default function HasPaths(o: unknown): o is IHasPaths {
	return (
		typeof o === 'object' &&
		o !== null &&
		'paths' in o &&
		typeof o.paths === 'object' &&
		o.paths !== null
	);
}
