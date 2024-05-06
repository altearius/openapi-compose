import { basename, dirname, relative, resolve } from 'node:path';
import HumanPath from './HumanPath.js';
import type ILog from './ILog.js';

export default function ResolveRefObject(
	filePath: string,
	apiPath: string,
	targetDirPath: string,
	pathObject: { $ref: unknown },
	log: ILog
) {
	const { $ref: refPath } = pathObject;

	if (typeof refPath !== 'string') {
		log.warn('Invalid $ref in', HumanPath(filePath), 'at', apiPath);
		return;
	}

	// TODO: refPath might be a URL to an external resource, or maybe
	// a file:// URL to a local resource. We should not assume it is
	// always a simple relative path.
	const hashIdx = refPath.indexOf('#');
	if (hashIdx !== -1) {
		const x = refPath.slice(0, hashIdx) || basename(filePath);
		const y = refPath.slice(hashIdx + 1);
		const absRefPath = resolve(dirname(filePath), x);
		const relRefPath = relative(targetDirPath, absRefPath);
		if (relRefPath.startsWith('..')) {
			log.warn(HumanPath(absRefPath), 'is outside the target directory');
			return;
		}

		return `./${relRefPath}#${y}`;
	}

	const absRefPath = resolve(dirname(filePath), refPath);
	const relRefPath = relative(targetDirPath, absRefPath);

	if (relRefPath.startsWith('..')) {
		log.warn(HumanPath(absRefPath), 'is outside the target directory');
		return;
	}

	return `./${relRefPath}#/paths/${apiPath.replaceAll('/', '~1')}`;
}
