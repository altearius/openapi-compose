import { relative } from 'node:path';
import HumanPath from './HumanPath.js';
import Log from './Log.js';
import ResolveRefObject from './ResolveRefObject.js';

export default function* ProcessPaths(
	file: string,
	paths: Record<string, unknown>,
	targetDir: string
): Generator<[string, string]> {
	for (const [path, pathObject] of Object.entries(paths)) {
		if (typeof pathObject !== 'object' || pathObject === null) {
			Log.warn('Invalid path object in', HumanPath(file));
			continue;
		}

		if ('$ref' in pathObject) {
			const refPath = ResolveRefObject(file, path, targetDir, pathObject);
			if (refPath) {
				yield [path, refPath];
			}

			continue;
		}

		const relRefPath = relative(targetDir, file);
		if (relRefPath.startsWith('..')) {
			Log.warn(HumanPath(file), 'is outside the target directory');
			continue;
		}

		yield [path, `./${relRefPath}#/paths/${path.replaceAll('/', '~1')}`];
	}
}
