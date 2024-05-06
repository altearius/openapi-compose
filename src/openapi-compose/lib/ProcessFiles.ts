import yaml from 'js-yaml';
import { readFile } from 'node:fs/promises';
import { styleText } from 'node:util';
import HasPaths from './HasPaths.js';
import HumanPath from './HumanPath.js';
import type ILog from './ILog.js';
import ProcessPaths from './ProcessPaths.js';

export default async function* ProcessFiles(
	files: readonly string[],
	targetDir: string,
	log: ILog
) {
	const seen = new Map<string, string>();

	for (const file of files) {
		log.debug('Processing', file);
		const content = await readFile(file, 'utf8');
		const doc = yaml.load(content, { filename: file });

		if (!HasPaths(doc)) {
			log.warn('No paths found in', HumanPath(file));
			continue;
		}

		for (const [apiPath, refPath] of ProcessPaths(
			file,
			doc.paths,
			targetDir,
			log
		)) {
			const lc = apiPath.toLowerCase();
			const existing = seen.get(lc);

			if (existing) {
				log.warn(
					'Path',
					styleText('yellowBright', apiPath),
					'already exists in',
					HumanPath(existing)
				);

				continue;
			}

			seen.set(lc, file);
			yield [apiPath, refPath] as const;
		}
	}
}
