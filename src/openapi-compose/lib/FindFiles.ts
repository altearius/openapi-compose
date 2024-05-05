import fg from 'fast-glob';
import { dirname } from 'node:path';
import HumanPath from './HumanPath.js';
import type IHasPaths from './IHasPaths.js';
import Log from './Log.js';
import ReadWildcards from './ReadWildcards.js';

export default async function FindFiles(
	template: IHasPaths,
	templatePath: string,
	targetPath: string
) {
	const wildcards = ReadWildcards(template);
	if (!wildcards.length) {
		Log.warn('No $imports found in', HumanPath(templatePath));
		return [];
	}

	const files = await fg([...wildcards], {
		absolute: true,
		caseSensitiveMatch: false,
		cwd: dirname(templatePath),
		ignore: [targetPath]
	});

	Log.debug('Found', files.length, 'files:', files);

	return files;
}
