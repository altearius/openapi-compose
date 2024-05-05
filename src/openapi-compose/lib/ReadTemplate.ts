import yaml from 'js-yaml';
import { readFile } from 'node:fs/promises';
import HasPaths from './HasPaths.js';
import HumanPath from './HumanPath.js';
import Log from './Log.js';

export default async function ReadTemplate(templatePath: string) {
	const contents = await readFile(templatePath, 'utf8');
	const template = yaml.load(contents, { filename: templatePath });

	if (!HasPaths(template)) {
		Log.warn('No paths found in', HumanPath(templatePath));
		return;
	}

	return template;
}
