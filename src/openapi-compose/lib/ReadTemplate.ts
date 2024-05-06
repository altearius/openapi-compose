import yaml from 'js-yaml';
import { readFile } from 'node:fs/promises';
import HasPaths from './HasPaths.js';
import HumanPath from './HumanPath.js';
import type ILog from './ILog.js';

export default async function ReadTemplate(templatePath: string, log: ILog) {
	const contents = await readFile(templatePath, 'utf8');
	const template = yaml.load(contents, { filename: templatePath });

	if (!HasPaths(template)) {
		log.warn('No paths found in', HumanPath(templatePath));
		return;
	}

	return template;
}
