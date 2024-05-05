import type IHasPaths from './IHasPaths.js';

export default function ReadWildcards(o: IHasPaths): readonly string[] {
	const {
		paths: { $imports: wildcards }
	} = o;

	if (typeof wildcards === 'string') {
		return [wildcards];
	}

	if (
		Array.isArray(wildcards) &&
		wildcards.every((x): x is string => typeof x === 'string')
	) {
		return wildcards;
	}

	return [];
}
