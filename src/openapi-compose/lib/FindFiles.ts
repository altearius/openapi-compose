import fg from 'fast-glob';
import { dirname } from 'node:path';
import HumanPath from './HumanPath.js';
import type IHasPaths from './IHasPaths.js';
import type ILog from './ILog.js';
import ReadWildcards from './ReadWildcards.js';

export default async function FindFiles(
	template: IHasPaths,
	templatePath: string,
	targetPath: string,
	log: ILog
) {
	const wildcards = ReadWildcards(template);
	if (!wildcards.length) {
		log.warn('No $imports found in', HumanPath(templatePath));
		return [];
	}

	const files = await fg([...wildcards], {
		absolute: true,
		caseSensitiveMatch: false,
		cwd: dirname(templatePath),
		ignore: [targetPath]
	});

	log.debug('Found', files.length, 'files:', files);

	return files;
}
