import { relative, resolve } from 'node:path';
import HumanPath from './HumanPath.js';
import Log from './Log.js';

export default function ResolveRefObject(
	fsPath: string,
	apiPath: string,
	targetDirPath: string,
	pathObject: { $ref: unknown }
) {
	const { $ref: refPath } = pathObject;

	if (typeof refPath !== 'string') {
		Log.warn('Invalid $ref in', HumanPath(fsPath), 'at', apiPath);
		return;
	}

	// TODO: refPath might be a URL to an external resource, or maybe
	// a file:// URL to a local resource. We should not assume it is
	// always a simple relative path.
	const hashIdx = refPath.indexOf('#');
	if (hashIdx !== -1) {
		const x = refPath.slice(0, hashIdx);
		const y = refPath.slice(hashIdx + 1);
		const absRefPath = resolve(fsPath, x);
		const relRefPath = relative(targetDirPath, absRefPath);
		if (relRefPath.startsWith('..')) {
			Log.warn(HumanPath(absRefPath), 'is outside the target directory');
			return;
		}

		return `./${relRefPath}#${y}`;
	}

	const absRefPath = resolve(fsPath, refPath);
	const relRefPath = relative(targetDirPath, absRefPath);

	if (relRefPath.startsWith('..')) {
		Log.warn(HumanPath(absRefPath), 'is outside the target directory');
		return;
	}

	return `./${relRefPath}#/paths/${apiPath.replaceAll('/', '~1')}`;
}
